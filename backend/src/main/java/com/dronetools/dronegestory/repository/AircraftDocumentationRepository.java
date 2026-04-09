package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AircraftDocumentationRepository extends JpaRepository<AircraftDocumentation, Integer> {
    List<AircraftDocumentation> findByAircraftId(Integer aircraftId);
    void deleteByAircraftId(Integer aircraftId);
}
