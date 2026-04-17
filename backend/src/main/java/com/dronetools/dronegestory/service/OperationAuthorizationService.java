package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperationAuthorizationService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    public boolean isAdminCurrent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public boolean isCreator(Operation operation, User user) {
        return operation.getCreador() != null
                && operation.getCreador().getId() != null
                && operation.getCreador().getId().equals(user.getId());
    }

    public boolean isAssigned(Operation operation, User user) {
        if (operation.getAnexo4Actual() == null || operation.getAnexo4Actual().getPersonalSeleccionado() == null) {
            return false;
        }
        return operation.getAnexo4Actual().getPersonalSeleccionado().stream()
                .anyMatch(u -> u.getId().equals(user.getId()));
    }

    public void assertCanAccessOperation(Operation operation) {
        if (isAdminCurrent()) {
            return;
        }
        User currentUser = getCurrentUser();
        if (isCreator(operation, currentUser) || isAssigned(operation, currentUser)) {
            return;
        }
        throw new RuntimeException("No tienes permisos para acceder a esta operación.");
    }

    public void assertCanOperateOperation(Operation operation) {
        assertCanAccessOperation(operation);
        if (operation.getEstado() == OperationStatus.COMPLETADA && !isAdminCurrent()) {
            throw new RuntimeException("Operación completada. Solo lectura para usuarios no administradores.");
        }
    }

    public void assertCanManageSelectedPersonnel(Operation operation) {
        User currentUser = getCurrentUser();
        if (!isCreator(operation, currentUser)) {
            throw new RuntimeException("Solo el responsable de la operación puede modificar el personal seleccionado.");
        }
        if (operation.getEstado() == OperationStatus.COMPLETADA && !isAdminCurrent()) {
            throw new RuntimeException("No se puede modificar el personal seleccionado en una operación completada.");
        }
    }

    public void assertCanSignAptitud(Operation operation) {
        User currentUser = getCurrentUser();
        if (isAssigned(operation, currentUser)) {
            return;
        }
        throw new RuntimeException("Solo el personal seleccionado puede firmar la aptitud para operar.");
    }

    public void assertCanRemoveAptitudSignature(Operation operation, Integer signatureUserId) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(signatureUserId) || isCreator(operation, currentUser)) {
            return;
        }
        throw new RuntimeException("Solo el firmante o el creador de la operación pueden cancelar esta firma.");
    }
}
