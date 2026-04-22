package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);

    @Query("select count(distinct u) from User u join u.roles r where u.state = true and r = :role")
    long countByRoleAndStateTrue(@Param("role") UserType role);
}
