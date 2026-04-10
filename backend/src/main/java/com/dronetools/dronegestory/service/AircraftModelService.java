package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AircraftModelService {

    private final AircraftModelRepository repository;

    public AircraftModelService(AircraftModelRepository repository) {
        this.repository = repository;
    }

    public AircraftModel findOrCreate(String manufacturer, String modelName) {
        if (manufacturer == null || modelName == null) {
            throw new IllegalArgumentException("Manufacturer and Model are required");
        }

        return repository.findByManufacturerAndModel(manufacturer.trim(), modelName.trim())
                .orElseGet(() -> {
                    AircraftModel newModel = new AircraftModel();
                    newModel.setManufacturer(manufacturer.trim());
                    newModel.setModel(modelName.trim());
                    return repository.save(newModel);
                });
    }
}
