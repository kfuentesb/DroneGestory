package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.FlightTime;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.FlightTimeRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;
    private final Anexo7Repository anexo7Repository;
    private final AircraftRepository aircraftRepository;
    private final FlightTimeRepository flightTimeRepository;

    public OperationService(OperationRepository operationRepository,
                            Anexo7Repository anexo7Repository,
                            AircraftRepository aircraftRepository,
                            FlightTimeRepository flightTimeRepository) {
        this.operationRepository = operationRepository;
        this.anexo7Repository = anexo7Repository;
        this.aircraftRepository = aircraftRepository;
        this.flightTimeRepository = flightTimeRepository;
    }

    @Transactional(readOnly = true)
    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Operation> findOperationsByUserId(Integer userId) {
        return operationRepository.findByCreadorId(userId);
    }

    @Transactional(readOnly = true)
    public String previewNextCodigo() {
        int anioActual = LocalDate.now().getYear();
        Integer ultimoCorrelativo = operationRepository.findMaxCorrelativoByAnio(anioActual);
        int siguienteCorrelativo = (ultimoCorrelativo == null ? 0 : ultimoCorrelativo) + 1;
        return formatearCodigo(anioActual, siguienteCorrelativo);
    }

    /**
     * Crea una operacion con codigo O-YYYY-NNN generado en backend.
     * Isolation.SERIALIZABLE protege el correlativo anual ante concurrencia.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public OperationDetailDTO createOperationDto(User creador, String conops) {
        int anioActual = LocalDate.now().getYear();
        List<Integer> correlativos = operationRepository.findTopCorrelativoByAnioForUpdate(anioActual, PageRequest.of(0, 1));
        int ultimoCorrelativo = correlativos.isEmpty() ? 0 : correlativos.getFirst();
        int siguienteCorrelativo = ultimoCorrelativo + 1;

        Operation operation = new Operation();
        operation.setCreador(creador);
        operation.setAnioCorrelativo(anioActual);
        operation.setCorrelativoAnual(siguienteCorrelativo);
        operation.setCodigo(formatearCodigo(anioActual, siguienteCorrelativo));
        operation.setConops(conops);

        Operation saved = operationRepository.save(operation);
        return new OperationDetailDTO(saved);
    }

    @Transactional
    public OperationDetailDTO updateOperationDto(Long operationId, Operation opActualizada) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setCodigo(opActualizada.getCodigo());

        if (opActualizada.getConops() != null) {
            op.setConops(opActualizada.getConops());
        }

        Operation saved = operationRepository.save(op);
        return new OperationDetailDTO(saved);
    }

    @Transactional(readOnly = true)
    public Operation findById(Long operationId) {
        return operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
    }

//    @Transactional
//    public void deleteOperation(Long operationId) {
//        operationRepository.deleteById(operationId);
//    }

    @Transactional
    public Operation updateOperationBasicData(Long operationId, String nuevoCodigo) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setCodigo(nuevoCodigo);
        return operationRepository.save(op);
    }

    @Transactional
    public Operation completarOperation(Long operationId) {
        Operation op = findById(operationId);
        if (!op.todosAnexosFirmados()) {
            throw new RuntimeException("No se puede completar la operación sin todos los anexos firmados");
        }
        registrarHorasVueloDesdeAnexo7(op);
        op.setEstado(OperationStatus.COMPLETADA);
        return operationRepository.save(op);
    }

    private void validarOperacionEditable(Operation op) {
        if (op.getEstado() == OperationStatus.COMPLETADA && !esAdminActual()) {
            throw new RuntimeException("Operación completada. Solo lectura para usuarios no administradores.");
        }
    }

    private boolean esAdminActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    // DTO
    @Transactional(readOnly = true)
    public OperationDetailDTO findByIdDto(Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        // La sesión sigue abierta, aquí puedes acceder a cualquier relación (creador, anexos, etc.)
        return new OperationDetailDTO(op);
    }

    // Trae todas las operaciones como DTOs
    @Transactional(readOnly = true)
    public List<OperationListDTO> getAllOperationListDTOs() {
        return operationRepository.findAll()
                .stream()
                .map(OperationListDTO::new)
                .toList();
    }

    // Trae solo las operaciones de un usuario como DTOs
    @Transactional(readOnly = true)
    public List<OperationListDTO> getMyOperationListDTOs(Integer userId) {
        return operationRepository.findByCreadorId(userId)
                .stream()
                .map(OperationListDTO::new)
                .toList();
    }

    @Transactional
    public OperationDetailDTO completarOperationDto(Long operationId) {
        Operation op = findById(operationId);
        if (!op.todosAnexosFirmados()) {
            throw new RuntimeException("No se puede completar la operación sin todos los anexos firmados");
        }
        registrarHorasVueloDesdeAnexo7(op);
        op.setEstado(OperationStatus.COMPLETADA);
        operationRepository.save(op);
        return new OperationDetailDTO(op); // El mapping ocurre aquí, en sesión
    }

    private void registrarHorasVueloDesdeAnexo7(Operation operation) {
        Anexo7 anexo7Actual = operation.getAnexo7Actual();
        if (anexo7Actual == null) {
            return;
        }

        List<Anexo7> entradas = anexo7Repository.findByOperationAndNumeroVersionAndMinutosVueloIsNotNull(
                operation,
                anexo7Actual.getNumeroVersion()
        );

        for (Anexo7 entrada : entradas) {
            Integer minutosVuelo = entrada.getMinutosVuelo();
            if (minutosVuelo == null || minutosVuelo <= 0) {
                continue;
            }
            if (entrada.getSerialAeronave() == null || entrada.getSerialAeronave().isBlank()) {
                continue;
            }

            Aircraft aircraft = aircraftRepository.findBySerialNumberIgnoreCase(entrada.getSerialAeronave())
                    .orElse(null);
            if (aircraft == null) {
                continue;
            }

            boolean yaRegistrado = flightTimeRepository
                    .existsByOperation_IdOperacionAndAircraft_AircraftId(operation.getIdOperacion(), aircraft.getAircraftId());
            if (yaRegistrado) {
                continue;
            }

            FlightTime flightTime = new FlightTime();
            flightTime.setAircraft(aircraft);
            flightTime.setAircraftManufacturer(
                    aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getManufacturer()
            );
            flightTime.setAircraftModel(
                    aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getModel()
            );
            flightTime.setAircraftSerialNumber(aircraft.getSerialNumber());
            flightTime.setOperation(operation);
            flightTime.setFlightDate(Date.valueOf(LocalDate.now()));
            flightTime.setDurationMinutes(minutosVuelo);
            int totalPrevio = flightTimeRepository
                    .findFirstByAircraft_AircraftIdOrderByFlightDateDescFlightTimeIdDesc(aircraft.getAircraftId())
                    .map(item -> item.getTotalFlightTimeMinutes() == null ? 0 : item.getTotalFlightTimeMinutes())
                    .orElse(aircraft.getFlightMinutes() == null ? 0 : aircraft.getFlightMinutes());
            flightTime.setTotalFlightTimeMinutes(totalPrevio + minutosVuelo);
            flightTimeRepository.save(flightTime);

            aircraft.setFlightMinutes(totalPrevio + minutosVuelo);
            aircraftRepository.save(aircraft);
        }
    }

    @Transactional
    public void deleteOperationWithAnexos(Long idOperacion) {
        Operation op = operationRepository.findById(idOperacion)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada: " + idOperacion));

        // Aquí podrías borrar archivos físicos si los anexos incluyen rutas de ficheros
        if (op.getAnexos4() != null) {
            op.getAnexos4().forEach(a4 -> {
                borrarArchivo(a4.getImagenEspacioAereo());
                borrarArchivo(a4.getImagenZonaVuelo());
                // Si tienes más campos con rutas de archivo, borralos aquí
            });
        }

        operationRepository.delete(op);
    }

    // HELPER
    private void borrarArchivo(String filePath) {
        if (filePath == null) return;
        try {
            java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(filePath));
        } catch (IOException e) {
            // log y/o manejar error según necesidad
        }
    }

    @Transactional
    public OperationDetailDTO updateConops(Long operationId, String conops) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setConops(conops);
        Operation saved = operationRepository.save(op);
        return new OperationDetailDTO(saved);
    }

    private String formatearCodigo(int anio, int correlativo) {
        return "O-" + anio + "-" + String.format("%03d", correlativo);
    }

}
