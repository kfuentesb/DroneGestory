package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AircraftModelService {

    private final AircraftModelRepository repository;

    public AircraftModelService(AircraftModelRepository repository) {
        this.repository = repository;
    }

    public List<AircraftModel> getAll() {
        return repository.findAllByOrderByManufacturerAscModelAsc();
    }

    public AircraftModel create(String manufacturer, String modelName) {
        String normalizedManufacturer = normalizeRequired(manufacturer, "Manufacturer");
        String normalizedModel = normalizeRequired(modelName, "Model");

        if (repository.findByManufacturerAndModel(normalizedManufacturer, normalizedModel).isPresent()) {
            throw new IllegalArgumentException("Aircraft model already exists.");
        }

        AircraftModel newModel = new AircraftModel();
        newModel.setManufacturer(normalizedManufacturer);
        newModel.setModel(normalizedModel);
        return repository.save(newModel);
    }

    public AircraftModel findOrCreate(String manufacturer, String modelName) {
        String normalizedManufacturer = normalizeRequired(manufacturer, "Manufacturer");
        String normalizedModel = normalizeRequired(modelName, "Model");

        return repository.findByManufacturerAndModel(normalizedManufacturer, normalizedModel)
                .orElseGet(() -> {
                    AircraftModel newModel = new AircraftModel();
                    newModel.setManufacturer(normalizedManufacturer);
                    newModel.setModel(normalizedModel);
                    return repository.save(newModel);
                });
    }

    private static String normalizeRequired(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim();
    }
}
