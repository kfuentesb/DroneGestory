package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.FlightTimeDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlightTimeDocumentationRepository extends JpaRepository<FlightTimeDocumentation, Long> {
    Optional<FlightTimeDocumentation> findByFlightTime_FlightTimeId(Long flightTimeId);
}
