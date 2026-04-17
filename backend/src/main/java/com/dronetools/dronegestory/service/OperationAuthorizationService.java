package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class OperationAuthorizationService {

    private final UserRepository userRepository;

    public OperationAuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado"));
    }

    public boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public boolean canManageOperation(Operation operation) {
        User currentUser = getCurrentUser();
        return canManageOperation(operation, currentUser);
    }

    public boolean canManageOperation(Operation operation, User user) {
        if (operation == null || user == null) {
            return false;
        }

        if (isCurrentUserAdmin()) {
            return true;
        }

        if (operation.getCreador() != null && operation.getCreador().getId().equals(user.getId())) {
            return true;
        }

        Anexo4 anexo4Actual = operation.getAnexo4Actual();
        if (anexo4Actual == null || anexo4Actual.getPersonalSeleccionado() == null) {
            return false;
        }

        return anexo4Actual.getPersonalSeleccionado().stream()
                .anyMatch(selectedUser -> selectedUser != null && selectedUser.getId().equals(user.getId()));
    }

    public void ensureCanManageOperation(Operation operation) {
        if (!canManageOperation(operation)) {
            throw new AccessDeniedException("No tienes permisos para gestionar esta operación");
        }
    }

    public boolean canEditPersonalSeleccionado(Operation operation) {
        if (operation == null) {
            return false;
        }
        User currentUser = getCurrentUser();
        if (operation.getEstado() == OperationStatus.COMPLETADA) {
            return false;
        }
        return operation.getCreador() != null && operation.getCreador().getId().equals(currentUser.getId());
    }

    public void ensureCanEditPersonalSeleccionado(Operation operation) {
        if (!canEditPersonalSeleccionado(operation)) {
            throw new AccessDeniedException("Solo el responsable puede modificar personal seleccionado mientras la operación no esté completada");
        }
    }
}
