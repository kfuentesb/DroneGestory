package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.model.enums.UserType;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;
    private final FlightTimeService flightTimeService;
    private final UserRepository userRepository;

    public OperationService(
            OperationRepository operationRepository,
            FlightTimeService flightTimeService,
            UserRepository userRepository
    ) {
        this.operationRepository = operationRepository;
        this.flightTimeService = flightTimeService;
        this.userRepository = userRepository;
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
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(saved, currentUser);
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
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(saved, currentUser);
    }

    @Transactional(readOnly = true)
    public Operation findById(Long operationId) {
        return operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("OperaciÃ³n no encontrada"));
    }

    @Transactional
    public Operation updateOperationBasicData(Long operationId, String nuevoCodigo) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setCodigo(nuevoCodigo);
        return operationRepository.save(op);
    }

    private void validarOperacionEditable(Operation op) {
        if (op.getEstado() == OperationStatus.CANCELADA) {
            throw new RuntimeException("OperaciÃ³n cancelada. Solo lectura.");
        }
        if (op.getEstado() == OperationStatus.COMPLETADA && !esAdminActual()) {
            throw new RuntimeException("OperaciÃ³n completada. Solo lectura para usuarios no administradores.");
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

    @Transactional(readOnly = true)
    public OperationDetailDTO findByIdDto(Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("OperaciÃ³n no encontrada"));
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(op, currentUser);
    }

    @Transactional(readOnly = true)
    public List<OperationListDTO> getAllOperationListDTOs() {
        User currentUser = getCurrentUserOrThrow();
        return operationRepository.findAll()
                .stream()
                .map(operation -> toListDto(operation, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OperationListDTO> getMyOperationListDTOs(Integer userId) {
        User currentUser = getCurrentUserOrThrow();
        return operationRepository.findByCreadorId(userId)
                .stream()
                .map(operation -> toListDto(operation, currentUser))
                .toList();
    }

    @Transactional
    public OperationDetailDTO completarOperationDto(Long operationId) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        if (!op.todosAnexosFirmados()) {
            throw new RuntimeException("No se puede completar la operaciÃ³n sin todos los anexos firmados");
        }
        op.setEstado(OperationStatus.COMPLETADA);
        Operation saved = operationRepository.save(op);
        flightTimeService.registerFromAnexo7WhenOperationCompleted(saved);
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(saved, currentUser);
    }

    @Transactional
    public OperationDetailDTO cancelarOperationDto(Long operationId) {
        Operation op = findById(operationId);
        if (op.getEstado() == OperationStatus.CANCELADA) {
            throw new RuntimeException("La operaciÃ³n ya estÃ¡ cancelada.");
        }
        op.setEstado(OperationStatus.CANCELADA);
        Operation saved = operationRepository.save(op);
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(saved, currentUser);
    }

    @Transactional
    public void deleteOperationWithAnexos(Long idOperacion) {
        Operation op = operationRepository.findById(idOperacion)
                .orElseThrow(() -> new RuntimeException("OperaciÃ³n no encontrada: " + idOperacion));

        if (op.getAnexos4() != null) {
            op.getAnexos4().forEach(a4 -> {
                borrarArchivo(a4.getImagenEspacioAereo());
                borrarArchivo(a4.getImagenZonaVuelo());
            });
        }

        operationRepository.delete(op);
    }

    private void borrarArchivo(String filePath) {
        if (filePath == null) return;
        try {
            java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(filePath));
        } catch (IOException ignored) {
        }
    }

    @Transactional
    public OperationDetailDTO updateConops(Long operationId, String conops) {
        Operation op = findById(operationId);
        validarOperacionEditable(op);
        op.setConops(conops);
        Operation saved = operationRepository.save(op);
        User currentUser = getCurrentUserOrThrow();
        return toDetailDto(saved, currentUser);
    }

    @Transactional(readOnly = true)
    public boolean canEditOperation(User user, Operation operation) {
        if (user == null || operation == null) {
            return false;
        }
        if (isPrivileged(user)) {
            return true;
        }
        boolean isCreator = operation.getCreador() != null && operation.getCreador().getId().equals(user.getId());
        boolean isAssigned = operation.getAssignedUsers() != null
                && operation.getAssignedUsers().stream().anyMatch(assigned -> assigned.getId().equals(user.getId()));
        return isCreator || isAssigned;
    }

    private OperationListDTO toListDto(Operation operation, User currentUser) {
        return new OperationListDTO(
                operation,
                currentUser.getId(),
                canEditOperation(currentUser, operation)
        );
    }

    private OperationDetailDTO toDetailDto(Operation operation, User currentUser) {
        return new OperationDetailDTO(
                operation,
                currentUser.getId(),
                canEditOperation(currentUser, operation)
        );
    }

    private User getCurrentUserOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado.");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private boolean isPrivileged(User user) {
        return user.getEffectiveRoles().contains(UserType.ADMIN)
                || user.getEffectiveRoles().contains(UserType.MANAGER);
    }

    private String formatearCodigo(int anio, int correlativo) {
        return "O-" + anio + "-" + String.format("%03d", correlativo);
    }
}
