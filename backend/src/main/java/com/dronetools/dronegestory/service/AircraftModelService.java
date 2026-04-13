package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.aircraft.AircraftModelRequestDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelUpdateDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AircraftModelService {

    private final AircraftModelRepository repository;
    private final AircraftRepository aircraftRepository;
    private final AircraftDocumentationService aircraftDocumentationService;
    private final AircraftModelDocumentationService aircraftModelDocumentationService;

    public AircraftModelService(
            AircraftModelRepository repository,
            AircraftRepository aircraftRepository,
            AircraftDocumentationService aircraftDocumentationService,
            AircraftModelDocumentationService aircraftModelDocumentationService
    ) {
        this.repository = repository;
        this.aircraftRepository = aircraftRepository;
        this.aircraftDocumentationService = aircraftDocumentationService;
        this.aircraftModelDocumentationService = aircraftModelDocumentationService;
    }

    public List<AircraftModel> getAll() {
        return repository.findAllByOrderByManufacturerAscModelAsc();
    }

    public Optional<AircraftModel> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public AircraftModel create(AircraftModelRequestDTO request, MultipartFile imageFile) throws IOException {
        String normalizedManufacturer = normalizeRequired(request.getManufacturer(), "Manufacturer");
        String normalizedModel = normalizeRequired(request.getModel(), "Model");

        if (repository.findByManufacturerAndModel(normalizedManufacturer, normalizedModel).isPresent()) {
            throw new IllegalArgumentException("Aircraft model already exists.");
        }

        AircraftModel newModel = new AircraftModel();
        newModel.setManufacturer(normalizedManufacturer);
        newModel.setModel(normalizedModel);
        newModel.setAircraftClassDefault(request.getAircraftClassDefault());
        newModel.setMtomDefault(request.getMtomDefault());
        newModel.setWingspanDefault(request.getWingspanDefault());
        newModel.setMaxSpeedDefault(request.getMaxSpeedDefault());
        newModel.setConfigDefault(request.getConfigDefault());
        newModel.setImpactEnergyDefault(request.getImpactEnergyDefault());
        newModel.setHasCameraDefault(request.getHasCameraDefault());
        newModel.setPrivatelyBuiltDefault(request.getPrivatelyBuiltDefault());
        newModel.setHasParachuteDefault(request.getHasParachuteDefault());
        newModel.setHasEnsuranceDefault(request.getHasEnsuranceDefault());
        newModel.setHasFTSDefault(request.getHasFTSDefault());
        newModel.setCautiveDefault(request.getCautiveDefault());
        newModel.setAccessoriesDefault(request.getAccessoriesDefault());
        AircraftModel savedModel = repository.save(newModel);
        if (imageFile != null && !imageFile.isEmpty()) {
            handleImageUpload(savedModel, imageFile);
            savedModel = repository.save(savedModel);
        }
        return savedModel;
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

    @Transactional
    public AircraftModel update(
            Long id,
            AircraftModelUpdateDTO dto,
            MultipartFile imageFile,
            boolean removeImage,
            Map<String, String[]> parameterMap
    ) throws IOException {
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

        handleImageLogic(model, imageFile, removeImage);
        return repository.save(model);
    }

    @Transactional
    public void deleteModelAndAircrafts(Long id) throws IOException {
        AircraftModel model = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft model not found with id: " + id));

        List<Aircraft> aircrafts = aircraftRepository.findByAircraftModelId(id);
        for (Aircraft aircraft : aircrafts) {
            aircraftDocumentationService.deleteByAircraftId(aircraft.getAircraftId());
            deleteExistingFile(aircraft.getImagePath());
        }
        aircraftRepository.deleteAll(aircrafts);

        aircraftModelDocumentationService.deleteByModelId(id);
        deleteExistingFile(model.getImagePath());
        repository.delete(model);
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

    private void handleImageUpload(AircraftModel model, MultipartFile imageFile) throws IOException {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path profileDir = uploadDir.resolve(Paths.get("aircraft-model", model.getId().toString(), "profile")).normalize();
        Files.createDirectories(profileDir);

        String filename = buildProfileFilename(model.getId(), imageFile.getOriginalFilename());
        Path target = profileDir.resolve(filename);
        imageFile.transferTo(target.toFile());

        model.setImagePath(Paths.get("aircraft-model", model.getId().toString(), "profile", filename)
                .toString().replace("\\", "/"));
    }

    private void handleImageLogic(AircraftModel model, MultipartFile imageFile, boolean removeImage) throws IOException {
        if (removeImage) {
            deleteExistingFile(model.getImagePath());
            model.setImagePath(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            deleteExistingFile(model.getImagePath());
            handleImageUpload(model, imageFile);
        }
    }

    private void deleteExistingFile(String relativePath) throws IOException {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path file = uploadDir.resolve(relativePath).normalize();
        if (file.startsWith(uploadDir)) {
            Files.deleteIfExists(file);
        }
    }

    private String buildProfileFilename(Long modelId, String originalFilename) {
        String safeName = (originalFilename == null || originalFilename.isBlank()) ? "upload" : Paths.get(originalFilename).getFileName().toString();
        int dot = safeName.lastIndexOf('.');
        String extension = dot >= 0 ? safeName.substring(dot) : "";
        return "aircraft_model_" + modelId + "_profile" + extension;
    }
}
