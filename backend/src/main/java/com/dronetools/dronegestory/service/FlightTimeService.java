package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.FlightTimeDTO;
import com.dronetools.dronegestory.dto.FlightTimeRequestDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.FlightTime;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.FlightTimeRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FlightTimeService {

    private final FlightTimeRepository flightTimeRepository;
    private final AircraftRepository aircraftRepository;
    private final OperationRepository operationRepository;
    private final FlightTimeDocumentationService flightTimeDocumentationService;

    public FlightTimeService(
            FlightTimeRepository flightTimeRepository,
            AircraftRepository aircraftRepository,
            OperationRepository operationRepository,
            FlightTimeDocumentationService flightTimeDocumentationService
    ) {
        this.flightTimeRepository = flightTimeRepository;
        this.aircraftRepository = aircraftRepository;
        this.operationRepository = operationRepository;
        this.flightTimeDocumentationService = flightTimeDocumentationService;
    }

    @Transactional(readOnly = true)
    public List<FlightTimeDTO> findAll() {
        return flightTimeRepository.findAllByOrderByFlightDateDescFlightTimeIdDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FlightTimeDTO> findByAircraftId(Long aircraftId) {
        return flightTimeRepository.findByAircraft_AircraftIdOrderByFlightDateDescFlightTimeIdDesc(aircraftId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<FlightTimeDTO> findById(Long id) {
        return flightTimeRepository.findById(id).map(this::toDto);
    }

    public FlightTimeDTO create(FlightTimeRequestDTO request) {
        FlightTime flightTime = new FlightTime();
        applyRequest(flightTime, request);
        FlightTime saved = flightTimeRepository.save(flightTime);
        recalculateAircraftFlightTimes(saved.getAircraft().getAircraftId());
        return toDto(flightTimeRepository.findById(saved.getFlightTimeId()).orElse(saved));
    }

    public Optional<FlightTimeDTO> update(Long id, FlightTimeRequestDTO request) {
        return flightTimeRepository.findById(id).map(existing -> {
            Long previousAircraftId = existing.getAircraft().getAircraftId();
            applyRequest(existing, request);
            FlightTime saved = flightTimeRepository.save(existing);
            recalculateAircraftFlightTimes(saved.getAircraft().getAircraftId());
            if (!previousAircraftId.equals(saved.getAircraft().getAircraftId())) {
                recalculateAircraftFlightTimes(previousAircraftId);
            }
            return toDto(saved);
        });
    }

    public void delete(Long id) {
        FlightTime flightTime = flightTimeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight time not found with id: " + id));

        Long aircraftId = flightTime.getAircraft().getAircraftId();
        flightTimeDocumentationService.deleteByFlightTimeId(id);
        flightTimeRepository.delete(flightTime);
        recalculateAircraftFlightTimes(aircraftId);
    }

    private void applyRequest(FlightTime flightTime, FlightTimeRequestDTO request) {
        if (request.aircraftId() == null) {
            throw new IllegalArgumentException("aircraftId is required");
        }
        if (request.flightDate() == null) {
            throw new IllegalArgumentException("flightDate is required");
        }
        if (request.durationMinutes() == null) {
            throw new IllegalArgumentException("durationMinutes is required");
        }
        if (request.durationMinutes() == 0) {
            throw new IllegalArgumentException("durationMinutes must not be zero");
        }
        // Permitimos duraciones negativas para ajustes de tiempo.

        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new EntityNotFoundException("Aircraft not found with id: " + request.aircraftId()));

        Operation operation = null;
        if (request.operationId() != null) {
            operation = operationRepository.findById(request.operationId())
                    .orElseThrow(() -> new EntityNotFoundException("Operation not found with id: " + request.operationId()));
        }

        flightTime.setAircraft(aircraft);
        flightTime.setOperation(operation);
        flightTime.setFlightDate(Date.valueOf(request.flightDate()));
        flightTime.setDurationMinutes(request.durationMinutes());
        if (flightTime.getTotalFlightTimeMinutes() == null) {
            flightTime.setTotalFlightTimeMinutes(0);
        }
    }

    private void recalculateAircraftFlightTimes(Long aircraftId) {
        Aircraft aircraft = aircraftRepository.findById(aircraftId)
                .orElseThrow(() -> new EntityNotFoundException("Aircraft not found with id: " + aircraftId));

        int cumulativeMinutes = 0;
        List<FlightTime> flights = flightTimeRepository.findByAircraft_AircraftIdOrderByFlightDateAscFlightTimeIdAsc(aircraftId);
        for (FlightTime flightTime : flights) {
            cumulativeMinutes += flightTime.getDurationMinutes() == null ? 0 : flightTime.getDurationMinutes();
            flightTime.setTotalFlightTimeMinutes(cumulativeMinutes);
        }

        aircraft.setFlightMinutes(cumulativeMinutes);
        aircraftRepository.save(aircraft);
        flightTimeRepository.saveAll(flights);
    }

    private FlightTimeDTO toDto(FlightTime flightTime) {
        return new FlightTimeDTO(
                flightTime.getFlightTimeId(),
                flightTime.getAircraft().getAircraftId(),
                flightTime.getAircraft().getAircraftModel() == null ? null : flightTime.getAircraft().getAircraftModel().getManufacturer(),
                flightTime.getAircraft().getAircraftModel() == null ? null : flightTime.getAircraft().getAircraftModel().getModel(),
                flightTime.getAircraft().getSerialNumber(),
                flightTime.getOperation() == null ? null : flightTime.getOperation().getIdOperacion(),
                flightTime.getOperation() == null ? null : flightTime.getOperation().getNombreOperacion(),
                flightTime.getFlightDate() == null ? null : flightTime.getFlightDate().toLocalDate(),
                flightTime.getDurationMinutes(),
                minutesToHours(flightTime.getDurationMinutes()),
                flightTime.getTotalFlightTimeMinutes(),
                minutesToHours(flightTime.getTotalFlightTimeMinutes()),
                flightTime.getDocumentation() == null ? null : flightTimeDocumentationService.toDto(flightTime.getDocumentation())
        );
    }

    private Double minutesToHours(Integer minutes) {
        if (minutes == null) {
            return null;
        }
        return minutes / 60.0;
    }
}
