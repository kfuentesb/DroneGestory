package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AircraftModelRepository extends JpaRepository<AircraftModel, Long> {
    
    /**
     * Finds a model by its manufacturer and model name.
     * Used by the service to link an aircraft to an existing catalog entry.
     */
    Optional<AircraftModel> findByManufacturerAndModel(String manufacturer, String model);

    @org.springframework.data.jpa.repository.Query(
            "select distinct am.manufacturer from AircraftModel am order by am.manufacturer asc"
    )
    List<String> findDistinctManufacturersOrderByManufacturerAsc();

    List<AircraftModel> findByManufacturerIgnoreCaseOrderByModelAsc(String manufacturer);

    List<AircraftModel> findAllByOrderByManufacturerAscModelAsc();
}
