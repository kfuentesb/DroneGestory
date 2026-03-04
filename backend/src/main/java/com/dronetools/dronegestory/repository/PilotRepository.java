package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Pilot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PilotRepository extends JpaRepository<Pilot, Integer> {
}