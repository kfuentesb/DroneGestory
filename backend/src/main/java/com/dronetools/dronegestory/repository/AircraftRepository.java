package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AircraftRepository extends JpaRepository<Aircraft, Integer> {
}