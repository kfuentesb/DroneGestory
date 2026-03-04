package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}