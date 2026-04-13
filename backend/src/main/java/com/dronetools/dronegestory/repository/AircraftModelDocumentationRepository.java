package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftModelDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AircraftModelDocumentationRepository extends JpaRepository<AircraftModelDocumentation, Long> {
    List<AircraftModelDocumentation> findByAircraftModel_Id(Long aircraftModelId);
    void deleteByAircraftModel_Id(Long aircraftModelId);
}
