package com.dronetools.dronegestory.security;

import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final UserRepository userRepository;

    public boolean isOwner(Authentication authentication, Integer id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();
        
        return userRepository.findById(id)
                .map(user -> user.getUsername().equals(currentUsername))
                .orElse(false);
    }
}