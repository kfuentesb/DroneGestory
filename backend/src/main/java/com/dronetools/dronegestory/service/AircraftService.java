package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.util.UploadPathUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@Service
public class AircraftService {

    private final AircraftRepository aircraftRepository;
    private final AircraftDocumentationService aircraftDocumentationService;
    private final AircraftModelService aircraftModelService;

    public AircraftService(
            AircraftRepository aircraftRepository,
            AircraftDocumentationService aircraftDocumentationService,
            AircraftModelService aircraftModelService
    ){
        this.aircraftRepository = aircraftRepository;
        this.aircraftDocumentationService = aircraftDocumentationService;
        this.aircraftModelService = aircraftModelService;
    }

    public List<Aircraft> getAllAircrafts() {
        return aircraftRepository.findAll();
    }

    public Optional<Aircraft> getAircraftById(Long id) {
        return aircraftRepository.findById(id);
    }

    @Transactional
    public Aircraft createWithFile(
            Aircraft aircraft,
            String manufacturer,
            String modelName,
            MultipartFile imageFile,
            boolean useModelDefaultImage
    ) throws IOException {

        AircraftModel model = aircraftModelService.findOrCreate(manufacturer, modelName);
        aircraft.setAircraftModel(model);

        Aircraft savedAircraft = aircraftRepository.save(aircraft);

        if (imageFile != null && !imageFile.isEmpty()) {
            handleImageUpload(savedAircraft, imageFile);
        } else if (useModelDefaultImage && model.getImagePath() != null && !model.getImagePath().isBlank()) {
            savedAircraft.setImagePath(model.getImagePath());
        }

        return aircraftRepository.save(savedAircraft);
    }

    @Transactional
    public Aircraft updateWithFile(
            Long id, 
            Aircraft updatedData, 
            String manufacturer, 
            String modelName,
            MultipartFile imageFile, 
            boolean removeImage,
            boolean mtomPresent, boolean wingspanPresent, boolean maxSpeedPresent,
            boolean impactEnergyPresent, boolean privatelyBuiltPresent,
            boolean hasParachutePresent, boolean hasEnsurancePresent,
            boolean hasFTSPresent, boolean cautivePresent, boolean accessoriesPresent,
            boolean fechaFabPresent, boolean powerSourcePresent, boolean powerSourceTypePresent
    ) throws IOException {
        
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft not found with id: " + id));

        // Update Model Relationship if provided
        if (manufacturer != null && modelName != null) {
            aircraft.setAircraftModel(aircraftModelService.findOrCreate(manufacturer, modelName));
        }

        // --- Standard Fields ---
        if (updatedData.getSerialNumber() != null) aircraft.setSerialNumber(updatedData.getSerialNumber());
        if (updatedData.getAircraftClass() != null) aircraft.setAircraftClass(updatedData.getAircraftClass());
        if (updatedData.getConfig() != null) aircraft.setConfig(updatedData.getConfig());
        if (updatedData.getHasCamera() != null) aircraft.setHasCamera(updatedData.getHasCamera());
        if (updatedData.getFechaFab() != null) aircraft.setFechaFab(updatedData.getFechaFab()); else if (fechaFabPresent) aircraft.setFechaFab(null);
        if (updatedData.getPowerSource() != null) aircraft.setPowerSource(updatedData.getPowerSource()); else if (powerSourcePresent) aircraft.setPowerSource(null);
        if (updatedData.getPowerSourceType() != null) aircraft.setPowerSourceType(updatedData.getPowerSourceType()); else if (powerSourceTypePresent) aircraft.setPowerSourceType(null);

        // Logic for nullable numeric/boolean fields (MTOM, Wingspan, etc.)
        updateNullableFields(aircraft, updatedData, mtomPresent, wingspanPresent, maxSpeedPresent, 
                            impactEnergyPresent, privatelyBuiltPresent, hasParachutePresent, 
                            hasEnsurancePresent, hasFTSPresent, cautivePresent, accessoriesPresent);

        // --- Image Logic ---
        handleImageLogic(aircraft, imageFile, removeImage);

        return aircraftRepository.save(aircraft);
    }

    private void handleImageUpload(Aircraft aircraft, MultipartFile imageFile) throws IOException {
        Path uploadDir = UploadPathUtils.databaseManagedRoot();
        Path profileDir = uploadDir.resolve(Paths.get("aircraft", aircraftFolder(aircraft), "profile")).normalize();
        Files.createDirectories(profileDir);

        String filename = buildProfileFilename(aircraft.getAircraftId(), imageFile.getOriginalFilename());
        Path target = profileDir.resolve(filename);
        imageFile.transferTo(target.toFile());

        aircraft.setImagePath(UploadPathUtils.databaseRelativePathString("aircraft", aircraftFolder(aircraft), "profile", filename));
    }

    private void handleImageLogic(Aircraft aircraft, MultipartFile imageFile, boolean removeImage) throws IOException {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String oldImage = aircraft.getImagePath();

        if (removeImage) {
            if (isAircraftSpecificImage(oldImage)) {
                deleteExistingImage(uploadDir, oldImage);
            }
            aircraft.setImagePath(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            if (isAircraftSpecificImage(oldImage)) {
                deleteExistingImage(uploadDir, oldImage);
            }
            handleImageUpload(aircraft, imageFile);
        }
    }

    private void updateNullableFields(Aircraft aircraft, Aircraft updatedData, /* ... booleans */
                                    boolean mtomP, boolean wingP, boolean speedP, boolean energyP, 
                                    boolean builtP, boolean paraP, boolean insuP, boolean ftsP, 
                                    boolean cautP, boolean accP) {
        
        if (updatedData.getMtom() != null) aircraft.setMtom(updatedData.getMtom()); else if (mtomP) aircraft.setMtom(null);
        if (updatedData.getWingspan() != null) aircraft.setWingspan(updatedData.getWingspan()); else if (wingP) aircraft.setWingspan(null);
        if (updatedData.getMaxSpeed() != null) aircraft.setMaxSpeed(updatedData.getMaxSpeed()); else if (speedP) aircraft.setMaxSpeed(null);
        if (updatedData.getImpactEnergy() != null) aircraft.setImpactEnergy(updatedData.getImpactEnergy()); else if (energyP) aircraft.setImpactEnergy(null);
        if (updatedData.getPrivatelyBuilt() != null) aircraft.setPrivatelyBuilt(updatedData.getPrivatelyBuilt()); else if (builtP) aircraft.setPrivatelyBuilt(null);
        if (updatedData.getHasParachute() != null) aircraft.setHasParachute(updatedData.getHasParachute()); else if (paraP) aircraft.setHasParachute(null);
        if (updatedData.getHasEnsurance() != null) aircraft.setHasEnsurance(updatedData.getHasEnsurance()); else if (insuP) aircraft.setHasEnsurance(null);
        if (updatedData.getHasFTS() != null) aircraft.setHasFTS(updatedData.getHasFTS()); else if (ftsP) aircraft.setHasFTS(null);
        if (updatedData.getCautive() != null) aircraft.setCautive(updatedData.getCautive()); else if (cautP) aircraft.setCautive(null);
        if (updatedData.getAccessories() != null) aircraft.setAccessories(updatedData.getAccessories()); else if (accP) aircraft.setAccessories(null);
    }

    private void deleteExistingImage(Path uploadDir, String oldImage) throws IOException {
        if (oldImage != null && !oldImage.isBlank()) {
            Path oldFile = uploadDir.resolve(oldImage).normalize();
            if (oldFile.startsWith(uploadDir)) {
                UploadPathUtils.deleteFileAndPruneEmptyParents(oldImage);
            }
        }
    }

    private String buildProfileFilename(Long aircraftId, String originalFilename) {
        String safeName = (originalFilename == null || originalFilename.isBlank()) ? "upload" : Paths.get(originalFilename).getFileName().toString();
        int dot = safeName.lastIndexOf('.');
        String extension = dot >= 0 ? safeName.substring(dot) : "";
        return "aircraft_" + aircraftId + "_profile" + extension;
    }

    private String aircraftFolder(Aircraft aircraft) {
        String modelName = aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getModel();
        return UploadPathUtils.aircraftFolder(aircraft.getSerialNumber(), modelName);
    }

    private boolean isAircraftSpecificImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return false;
        }
        String cleanPath = UploadPathUtils.cleanRelativePath(imagePath);
        return cleanPath.startsWith("aircraft/")
                || cleanPath.startsWith(UploadPathUtils.DATABASE_RELATED_DIR + "/aircraft/");
    }

    @Transactional
    public void deleteAircraft(Long id) {
        if (!aircraftRepository.existsById(id)) {
            throw new RuntimeException("Aircraft not found with id: " + id);
        }
        aircraftDocumentationService.deleteByAircraftId(id);
        aircraftRepository.deleteById(id);
    }

    @Transactional
    public Aircraft createWithFileAndDocumentation(
            Aircraft aircraft,
            String manufacturer,
            String modelName,
            MultipartFile imageFile,
            boolean useModelDefaultImage,
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        
        Aircraft savedAircraft = createWithFile(aircraft, manufacturer, modelName, imageFile, useModelDefaultImage);
        
        // 2. Save the associated documentation linked to this specific aircraft
        aircraftDocumentationService.initializeFromModelAndSpecificUploads(savedAircraft, documentations, multipartRequest);
        
        return savedAircraft;
    }

    public boolean existsBySerialNumber(String serialNumber) {
        return aircraftRepository.existsBySerialNumber(serialNumber == null ? null : serialNumber.trim().toUpperCase());
    }
}
