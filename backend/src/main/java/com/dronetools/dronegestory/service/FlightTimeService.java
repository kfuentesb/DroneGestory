package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.FlightTimeDTO;
import com.dronetools.dronegestory.dto.FlightTimeRequestDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.FlightTime;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.FlightTimeRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class FlightTimeService {

    private final FlightTimeRepository flightTimeRepository;
    private final AircraftRepository aircraftRepository;
    private final OperationRepository operationRepository;
    private final FlightTimeDocumentationService flightTimeDocumentationService;
    private final AuditLogService auditLogService;

    public FlightTimeService(
            FlightTimeRepository flightTimeRepository,
            AircraftRepository aircraftRepository,
            OperationRepository operationRepository,
            FlightTimeDocumentationService flightTimeDocumentationService,
            AuditLogService auditLogService
    ) {
        this.flightTimeRepository = flightTimeRepository;
        this.aircraftRepository = aircraftRepository;
        this.operationRepository = operationRepository;
        this.flightTimeDocumentationService = flightTimeDocumentationService;
        this.auditLogService = auditLogService;
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
            String before = summarize(existing);
            applyRequest(existing, request);
            FlightTime saved = flightTimeRepository.save(existing);
            recalculateAircraftFlightTimes(saved.getAircraft().getAircraftId());
            if (!previousAircraftId.equals(saved.getAircraft().getAircraftId())) {
                recalculateAircraftFlightTimes(previousAircraftId);
            }
            auditLogService.record(
                    "MODIFICAR_HORAS_VUELO",
                    saved.getFlightTimeId(),
                    "antes={" + before + "} despues={" + summarize(saved) + "}"
            );
            return toDto(saved);
        });
    }

    public void delete(Long id) {
        FlightTime flightTime = flightTimeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight time not found with id: " + id));

        Long aircraftId = flightTime.getAircraft().getAircraftId();
        String snapshot = summarize(flightTime);
        flightTimeDocumentationService.deleteByFlightTimeId(id);
        flightTimeRepository.delete(flightTime);
        recalculateAircraftFlightTimes(aircraftId);
        auditLogService.record("BORRAR_HORAS_VUELO", id, snapshot);
    }

    public void registerFromAnexo7WhenOperationCompleted(Operation operation) {
        if (operation == null || operation.getIdOperacion() == null || operation.getAnexos7() == null || operation.getAnexos7().isEmpty()) {
            return;
        }

        Map<Long, Anexo7> latestAnexoByAircraft = operation.getAnexos7().stream()
                .filter(anexo7 -> anexo7.getAircraftId() != null)
                .collect(Collectors.toMap(
                        Anexo7::getAircraftId,
                        anexo7 -> anexo7,
                        (left, right) -> left.getNumeroVersion() >= right.getNumeroVersion() ? left : right
                ));

        Set<Long> aircraftIdsInvolved = resolveAircraftIdsInvolved(operation, latestAnexoByAircraft.keySet());

        for (Long aircraftId : aircraftIdsInvolved) {
            Anexo7 anexo7 = latestAnexoByAircraft.get(aircraftId);
            if (anexo7 == null) {
                throw new IllegalArgumentException(
                        "Falta el Anexo 7 para la aeronave " + aircraftId + " en la operacion " + operation.getCodigo()
                );
            }
            validateAnexo7FlightTimeData(anexo7, operation.getCodigo());

            boolean alreadyExists = flightTimeRepository.existsByOperation_IdOperacionAndAircraft_AircraftId(
                    operation.getIdOperacion(),
                    aircraftId
            );
            if (alreadyExists) {
                continue;
            }

            create(new FlightTimeRequestDTO(
                    aircraftId,
                    operation.getIdOperacion(),
                    LocalDate.from(anexo7.getFechaOp()),
                    anexo7.getTiempoVueloMinutos(),
                    buildAutomaticComment(anexo7)

            ));
        }
    }

    private Set<Long> resolveAircraftIdsInvolved(Operation operation, Set<Long> fallbackAircraftIds) {
        Anexo4 latestAnexo4 = operation.getAnexo4Actual();
        Set<Long> aircraftIds = new LinkedHashSet<>();
        if (latestAnexo4 != null && latestAnexo4.getAircraftIds() != null) {
            latestAnexo4.getAircraftIds().stream()
                    .filter(id -> id != null && id > 0)
                    .forEach(aircraftIds::add);
        }
        if (aircraftIds.isEmpty()) {
            aircraftIds.addAll(fallbackAircraftIds);
        }
        return aircraftIds;
    }

    private String buildAutomaticComment(Anexo7 anexo7) {
        LocalDate fechaOp = LocalDate.from(anexo7.getFechaOp());
        return "Registro automático desde Anexo 7: +" + anexo7.getTiempoVueloMinutos()
                + " min";
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
        flightTime.setAircraftManufacturer(aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getManufacturer());
        flightTime.setAircraftModel(aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getModel());
        flightTime.setAircraftSerialNumber(aircraft.getSerialNumber());
        flightTime.setOperation(operation);
        flightTime.setFlightDate(Date.valueOf(request.flightDate()));
        flightTime.setDurationMinutes(request.durationMinutes());
        flightTime.setComments(normalizeComments(request.comments()));
        if (flightTime.getTotalFlightTimeMinutes() == null) {
            flightTime.setTotalFlightTimeMinutes(0);
        }
    }

    private void validateAnexo7FlightTimeData(Anexo7 anexo7, String operationCode) {
        if (anexo7.getFechaOp() == null) {
            throw new IllegalArgumentException("Anexo 7 sin fechaOp para la aeronave " + anexo7.getAircraftId() +
                    " en la operacion " + operationCode);
        }
        if (anexo7.getTiempoVueloMinutos() == null || anexo7.getTiempoVueloMinutos() <= 0) {
            throw new IllegalArgumentException("Anexo 7 sin tiempoVueloMinutos valido para la aeronave " + anexo7.getAircraftId() +
                    " en la operacion " + operationCode);
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
                flightTime.getAircraftManufacturer(),
                flightTime.getAircraftModel(),
                flightTime.getAircraftSerialNumber(),
                flightTime.getOperation() == null ? null : flightTime.getOperation().getIdOperacion(),
                flightTime.getOperation() == null ? null : flightTime.getOperation().getCodigo(),
                flightTime.getFlightDate() == null ? null : flightTime.getFlightDate().toLocalDate(),
                flightTime.getDurationMinutes(),
                minutesToHours(flightTime.getDurationMinutes()),
                flightTime.getTotalFlightTimeMinutes(),
                minutesToHours(flightTime.getTotalFlightTimeMinutes()),
                flightTime.getComments(),
                flightTime.getDocumentation() == null ? null : flightTimeDocumentationService.toDto(flightTime.getDocumentation())
        );
    }

    private String normalizeComments(String comments) {
        if (comments == null) {
            return null;
        }
        String trimmedComments = comments.trim();
        return trimmedComments.isEmpty() ? null : trimmedComments;
    }

    private Double minutesToHours(Integer minutes) {
        if (minutes == null) {
            return null;
        }
        return minutes / 60.0;
    }

    private String summarize(FlightTime flightTime) {
        return "flightTimeId=" + flightTime.getFlightTimeId()
                + ", aircraftId=" + (flightTime.getAircraft() == null ? null : flightTime.getAircraft().getAircraftId())
                + ", aircraftManufacturer=" + flightTime.getAircraftManufacturer()
                + ", aircraftModel=" + flightTime.getAircraftModel()
                + ", aircraftSerialNumber=" + flightTime.getAircraftSerialNumber()
                + ", operationId=" + (flightTime.getOperation() == null ? null : flightTime.getOperation().getIdOperacion())
                + ", operationCode=" + (flightTime.getOperation() == null ? null : flightTime.getOperation().getCodigo())
                + ", flightDate=" + (flightTime.getFlightDate() == null ? null : flightTime.getFlightDate().toLocalDate())
                + ", durationMinutes=" + flightTime.getDurationMinutes()
                + ", totalFlightTimeMinutes=" + flightTime.getTotalFlightTimeMinutes()
                + ", comments=" + flightTime.getComments();
    }
}
