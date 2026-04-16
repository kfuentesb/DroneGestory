package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;

    public OperationService(OperationRepository operationRepository) {
        this.operationRepository = operationRepository;
    }

    @Transactional(readOnly = true)
    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Operation> findOperationsByUserId(Integer userId) {
        return operationRepository.findByCreadorId(userId);
    }

    @Transactional
    public OperationDetailDTO saveOperationDto(Operation op) {
        Operation saved = operationRepository.save(op);
        return new OperationDetailDTO(saved);
    }

    @Transactional
    public OperationDetailDTO updateOperationDto(Long operationId, Operation opActualizada) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setNombreOperacion(opActualizada.getNombreOperacion());

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
    public Operation updateOperationBasicData(Long operationId, String nuevoNombre) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setNombreOperacion(nuevoNombre);
        return operationRepository.save(op);
    }

    @Transactional
    public Operation completarOperation(Long operationId) {
        Operation op = findById(operationId);
        if (!op.todosAnexosFirmados()) {
            throw new RuntimeException("No se puede completar la operación sin todos los anexos firmados");
        }
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
        op.setEstado(OperationStatus.COMPLETADA);
        operationRepository.save(op);
        return new OperationDetailDTO(op); // El mapping ocurre aquí, en sesión
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

}
