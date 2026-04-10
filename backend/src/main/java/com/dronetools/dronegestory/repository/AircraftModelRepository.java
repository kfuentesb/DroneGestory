package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AircraftModelRepository extends JpaRepository<AircraftModel, Integer> {
    
    /**
     * Finds a model by its manufacturer and model name.
     * Used by the service to link an aircraft to an existing catalog entry.
     */
    Optional<AircraftModel> findByManufacturerAndModel(String manufacturer, String model);
}