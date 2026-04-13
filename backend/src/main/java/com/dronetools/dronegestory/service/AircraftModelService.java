package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.aircraft.AircraftModelRequestDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelUpdateDTO;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AircraftModelService {

    private final AircraftModelRepository repository;

    public AircraftModelService(AircraftModelRepository repository) {
        this.repository = repository;
    }

    public List<AircraftModel> getAll() {
        return repository.findAllByOrderByManufacturerAscModelAsc();
    }

    public Optional<AircraftModel> getById(Long id) {
        return repository.findById(id);
    }

    public AircraftModel create(AircraftModelRequestDTO request) {
        String normalizedManufacturer = normalizeRequired(request.manufacturer(), "Manufacturer");
        String normalizedModel = normalizeRequired(request.model(), "Model");

        if (repository.findByManufacturerAndModel(normalizedManufacturer, normalizedModel).isPresent()) {
            throw new IllegalArgumentException("Aircraft model already exists.");
        }

        AircraftModel newModel = new AircraftModel();
        newModel.setManufacturer(normalizedManufacturer);
        newModel.setModel(normalizedModel);
        newModel.setAircraftClassDefault(request.aircraftClassDefault());
        newModel.setMtomDefault(request.mtomDefault());
        newModel.setWingspanDefault(request.wingspanDefault());
        newModel.setMaxSpeedDefault(request.maxSpeedDefault());
        newModel.setConfigDefault(request.configDefault());
        newModel.setImpactEnergyDefault(request.impactEnergyDefault());
        newModel.setHasCameraDefault(request.hasCameraDefault());
        newModel.setPrivatelyBuiltDefault(request.privatelyBuiltDefault());
        newModel.setHasParachuteDefault(request.hasParachuteDefault());
        newModel.setHasEnsuranceDefault(request.hasEnsuranceDefault());
        newModel.setHasFTSDefault(request.hasFTSDefault());
        newModel.setCautiveDefault(request.cautiveDefault());
        newModel.setAccessoriesDefault(request.accessoriesDefault());
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

    public AircraftModel update(Long id, AircraftModelUpdateDTO dto, Map<String, String[]> parameterMap) {
        AircraftModel model = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft model not found with id: " + id));

        boolean manufacturerPresent = parameterMap.containsKey("manufacturer");
        boolean modelPresent = parameterMap.containsKey("model");

        if (manufacturerPresent) {
            model.setManufacturer(normalizeRequired(dto.getManufacturer(), "Manufacturer"));
        }
        if (modelPresent) {
            model.setModel(normalizeRequired(dto.getModel(), "Model"));
        }

        if (manufacturerPresent || modelPresent) {
            repository.findByManufacturerAndModel(model.getManufacturer(), model.getModel())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Aircraft model already exists.");
                    });
        }

        applyIfPresent(parameterMap, "aircraftClassDefault", dto.getAircraftClassDefault(), model::setAircraftClassDefault);
        applyIfPresent(parameterMap, "mtomDefault", dto.getMtomDefault(), model::setMtomDefault);
        applyIfPresent(parameterMap, "wingspanDefault", dto.getWingspanDefault(), model::setWingspanDefault);
        applyIfPresent(parameterMap, "maxSpeedDefault", dto.getMaxSpeedDefault(), model::setMaxSpeedDefault);
        applyIfPresent(parameterMap, "configDefault", dto.getConfigDefault(), model::setConfigDefault);
        applyIfPresent(parameterMap, "impactEnergyDefault", dto.getImpactEnergyDefault(), model::setImpactEnergyDefault);
        applyIfPresent(parameterMap, "hasCameraDefault", dto.getHasCameraDefault(), model::setHasCameraDefault);
        applyIfPresent(parameterMap, "privatelyBuiltDefault", dto.getPrivatelyBuiltDefault(), model::setPrivatelyBuiltDefault);
        applyIfPresent(parameterMap, "hasParachuteDefault", dto.getHasParachuteDefault(), model::setHasParachuteDefault);
        applyIfPresent(parameterMap, "hasEnsuranceDefault", dto.getHasEnsuranceDefault(), model::setHasEnsuranceDefault);
        applyIfPresent(parameterMap, "hasFTSDefault", dto.getHasFTSDefault(), model::setHasFTSDefault);
        applyIfPresent(parameterMap, "cautiveDefault", dto.getCautiveDefault(), model::setCautiveDefault);
        applyIfPresent(parameterMap, "accessoriesDefault", normalizeNullableText(dto.getAccessoriesDefault()), model::setAccessoriesDefault);

        return repository.save(model);
    }

    private static <T> void applyIfPresent(
            Map<String, String[]> parameterMap,
            String key,
            T value,
            java.util.function.Consumer<T> setter
    ) {
        if (parameterMap.containsKey(key)) {
            setter.accept(value);
        }
    }

    private static String normalizeRequired(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim();
    }

    private static String normalizeNullableText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
