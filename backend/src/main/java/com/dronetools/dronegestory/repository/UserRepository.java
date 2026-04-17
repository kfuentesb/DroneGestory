package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
    long countByTypeAndStateTrue(com.dronetools.dronegestory.model.enums.UserType type);
}