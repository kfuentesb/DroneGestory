package com.dronetools.dronegestory.security;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.UserType;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("operationSecurity")
@RequiredArgsConstructor
public class OperationSecurity {

    private final UserRepository userRepository;
    private final OperationRepository operationRepository;

    public boolean canCreateOperation(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) {
            return false;
        }
        return isPrivileged(user);
    }

    public boolean canDeleteOperation(Authentication authentication, Long operationId) {
        User user = resolveUser(authentication);
        if (user == null) {
            return false;
        }
        return user.getEffectiveRoles().contains(UserType.ADMIN);
    }

    public boolean canCancelOperation(Authentication authentication, Long operationId) {
        User user = resolveUser(authentication);
        if (user == null) {
            return false;
        }
        return isPrivileged(user);
    }

    public boolean canEditOperation(Authentication authentication, Long operationId) {
        User user = resolveUser(authentication);
        if (user == null) {
            return false;
        }

        if (isPrivileged(user)) {
            return true;
        }

        Operation operation = operationRepository.findByIdWithAssignedUsers(operationId).orElse(null);
        if (operation == null) {
            return false;
        }

        boolean isCreator = operation.getCreador() != null && operation.getCreador().getId().equals(user.getId());
        boolean isAssigned = operation.getAssignedUsers() != null
                && operation.getAssignedUsers().stream().anyMatch(assigned -> assigned.getId().equals(user.getId()));
        return isCreator || isAssigned;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    private boolean isPrivileged(User user) {
        return user.getEffectiveRoles().contains(UserType.ADMIN)
                || user.getEffectiveRoles().contains(UserType.MANAGER);
    }
}
