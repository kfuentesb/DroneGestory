package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class OperationAccessService {
    private static final Logger LOGGER = LoggerFactory.getLogger(OperationAccessService.class);

    private final UserRepository userRepository;
    private final OperationRepository operationRepository;

    public OperationAccessService(UserRepository userRepository, OperationRepository operationRepository) {
        this.userRepository = userRepository;
        this.operationRepository = operationRepository;
    }

    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void assertCanAccess(Operation operation) {
        Integer currentUserId = getCurrentUserId();
        boolean isOwner = operation.getCreador() != null
                && operation.getCreador().getId() != null
                && operation.getCreador().getId().equals(currentUserId);

        boolean hasAssignedAccess = operation.getUsuariosConAcceso() != null
                && operation.getUsuariosConAcceso().stream()
                .anyMatch(user -> user.getId() != null && user.getId().equals(currentUserId));

        if (!isOwner && !hasAssignedAccess) {
            throw new RuntimeException("No tienes acceso a esta operación");
        }
    }

    public void assertCanAccess(Long operationId) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        assertCanAccess(operation);
    }

    public List<Operation> findAccessibleOperationsForCurrentUser() {
        return operationRepository.findAccessibleByUserId(getCurrentUserId());
    }

    public Operation findAccessibleOperationById(Long operationId) {
        return operationRepository.findAccessibleByOperationIdAndUserId(operationId, getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("Operación no encontrada o sin permisos"));
    }

    public void syncAssignedUsersFromPersonal(Operation operation, String personalRaw) {
        Set<Integer> assignedUserIds = parsePersonalIds(personalRaw);
        Set<User> assignedUsers = new LinkedHashSet<>();

        if (!assignedUserIds.isEmpty()) {
            assignedUsers.addAll(userRepository.findAllById(assignedUserIds));
        }

        operation.setUsuariosConAcceso(new LinkedHashSet<>(assignedUsers));
    }

    private Set<Integer> parsePersonalIds(String personalRaw) {
        if (personalRaw == null || personalRaw.isBlank()) {
            return Set.of();
        }

        Set<Integer> ids = new LinkedHashSet<>();
        Arrays.stream(personalRaw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .forEach(value -> {
                    try {
                        ids.add(Integer.valueOf(value));
                    } catch (NumberFormatException ignored) {
                        LOGGER.warn("ID de personal inválido en Anexo4: {}", value);
                    }
                });
        return ids;
    }
}
