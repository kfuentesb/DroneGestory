package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.MaintenanceDTO;
import com.dronetools.dronegestory.dto.MaintenanceRequestDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.Maintenance;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.MaintenanceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AircraftRepository aircraftRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository, AircraftRepository aircraftRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.aircraftRepository = aircraftRepository;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> findAll() {
        return maintenanceRepository.findAllByOrderByMaintenanceDateDescMaintenanceIdDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> findByAircraftId(Long aircraftId) {
        return maintenanceRepository.findByAircraft_AircraftIdOrderByMaintenanceDateDescMaintenanceIdDesc(aircraftId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<MaintenanceDTO> findById(Long id) {
        return maintenanceRepository.findById(id).map(this::toDto);
    }

    public MaintenanceDTO create(MaintenanceRequestDTO request) {
        Maintenance maintenance = new Maintenance();
        applyRequest(maintenance, request);
        return toDto(maintenanceRepository.save(maintenance));
    }

    public Optional<MaintenanceDTO> update(Long id, MaintenanceRequestDTO request) {
        return maintenanceRepository.findById(id).map(existing -> {
            applyRequest(existing, request);
            return toDto(maintenanceRepository.save(existing));
        });
    }

    public void delete(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new EntityNotFoundException("Maintenance not found with id: " + id);
        }
        maintenanceRepository.deleteById(id);
    }

    private void applyRequest(Maintenance maintenance, MaintenanceRequestDTO request) {
        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new EntityNotFoundException("Aircraft not found with id: " + request.aircraftId()));

        if (request.reviewType() == null || request.reviewType().isBlank()) {
            throw new IllegalArgumentException("reviewType is required");
        }
        if (request.monthsRequired() == null) {
            throw new IllegalArgumentException("monthsRequired is required");
        }
        if (request.hoursFlightRequired() == null) {
            throw new IllegalArgumentException("hoursFlightRequired is required");
        }
        if (request.maintenanceDate() == null) {
            throw new IllegalArgumentException("maintenanceDate is required");
        }

        maintenance.setAircraft(aircraft);
        maintenance.setReviewType(request.reviewType().trim());
        maintenance.setMonthsRequired(request.monthsRequired());
        maintenance.setHoursFlightRequired(request.hoursFlightRequired());
        maintenance.setMaintenanceDate(Date.valueOf(request.maintenanceDate()));
        maintenance.setComments(request.comments());
    }

    private MaintenanceDTO toDto(Maintenance maintenance) {
        Aircraft aircraft = maintenance.getAircraft();
        return new MaintenanceDTO(
                maintenance.getMaintenanceId(),
                aircraft.getAircraftId(),
                aircraft.getAircraftClass() == null ? null : aircraft.getAircraftClass().name(),
                aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getManufacturer(),
                aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getModel(),
                aircraft.getSerialNumber(),
                aircraft.getFlightMinutes(),
                maintenance.getReviewType(),
                maintenance.getMonthsRequired(),
                maintenance.getHoursFlightRequired(),
                maintenance.getMaintenanceDate() == null ? null : maintenance.getMaintenanceDate().toLocalDate(),
                maintenance.getComments()
        );
    }
}
