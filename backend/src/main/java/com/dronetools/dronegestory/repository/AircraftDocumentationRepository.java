package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AircraftDocumentationRepository extends JpaRepository<AircraftDocumentation, Long> {
    // Spring will now look for aircraft.aircraftId
    void deleteByAircraft_AircraftId(Long aircraftId);
    List<AircraftDocumentation> findByAircraft_AircraftId(Long aircraftId);
    List<AircraftDocumentation> findByModelDocumentation_Id(Long modelDocumentationId);
}
