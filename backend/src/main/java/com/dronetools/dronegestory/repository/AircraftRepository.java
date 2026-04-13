package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    
    // Find all drones of a specific model 
    List<Aircraft> findByAircraftModelId(Long modelId);
    
    // Find by manufacturer through the relationship
    List<Aircraft> findByAircraftModelManufacturerIgnoreCase(String manufacturer);
}