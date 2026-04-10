package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.repository.AircraftRepository;
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
    public Aircraft createWithFile(Aircraft aircraft, String manufacturer, String modelName, MultipartFile imageFile) throws IOException {

        AircraftModel model = aircraftModelService.findOrCreate(manufacturer, modelName);
        aircraft.setAircraftModel(model);

        Aircraft savedAircraft = aircraftRepository.save(aircraft);

        if (imageFile != null && !imageFile.isEmpty()) {
            handleImageUpload(savedAircraft, imageFile);
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
            boolean hasFTSPresent, boolean cautivePresent, boolean accessoriesPresent
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

        // Logic for nullable numeric/boolean fields (MTOM, Wingspan, etc.)
        updateNullableFields(aircraft, updatedData, mtomPresent, wingspanPresent, maxSpeedPresent, 
                            impactEnergyPresent, privatelyBuiltPresent, hasParachutePresent, 
                            hasEnsurancePresent, hasFTSPresent, cautivePresent, accessoriesPresent);

        // --- Image Logic ---
        handleImageLogic(aircraft, imageFile, removeImage);

        return aircraftRepository.save(aircraft);
    }

    private void handleImageUpload(Aircraft aircraft, MultipartFile imageFile) throws IOException {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path profileDir = uploadDir.resolve(Paths.get("aircraft", aircraft.getId().toString(), "profile")).normalize();
        Files.createDirectories(profileDir);

        String filename = buildProfileFilename(aircraft.getId(), imageFile.getOriginalFilename());
        Path target = profileDir.resolve(filename);
        imageFile.transferTo(target.toFile());

        aircraft.setImagePath(Paths.get("aircraft", aircraft.getId().toString(), "profile", filename)
                .toString().replace("\\", "/"));
    }

    private void handleImageLogic(Aircraft aircraft, MultipartFile imageFile, boolean removeImage) throws IOException {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String oldImage = aircraft.getImagePath();

        if (removeImage) {
            deleteExistingImage(uploadDir, oldImage);
            aircraft.setImagePath(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            deleteExistingImage(uploadDir, oldImage);
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
                Files.deleteIfExists(oldFile);
            }
        }
    }

    private String buildProfileFilename(Long aircraftId, String originalFilename) {
        String safeName = (originalFilename == null || originalFilename.isBlank()) ? "upload" : Paths.get(originalFilename).getFileName().toString();
        int dot = safeName.lastIndexOf('.');
        String extension = dot >= 0 ? safeName.substring(dot) : "";
        return "aircraft_" + aircraftId + "_profile" + extension;
    }

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
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        
        Aircraft savedAircraft = createWithFile(aircraft, manufacturer, modelName, imageFile);
        
        // 2. Save the associated documentation linked to this specific aircraft
        if (documentations != null && !documentations.isEmpty()) {
            aircraftDocumentationService.saveFromUploadRequests(savedAircraft, documentations, multipartRequest);
        }
        
        return savedAircraft;
    }
}

// package com.dronetools.dronegestory.service;

// import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
// import com.dronetools.dronegestory.model.Aircraft;
// import com.dronetools.dronegestory.repository.AircraftRepository;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.multipart.MultipartHttpServletRequest;

// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.util.List;
// import java.util.Optional;

// @Service
// public class AircraftService {

//     private final AircraftRepository aircraftRepository;
//     private final AircraftDocumentationService aircraftDocumentationService;

//     public AircraftService(
//             AircraftRepository aircraftRepository,
//             AircraftDocumentationService aircraftDocumentationService
//     ){
//         this.aircraftRepository = aircraftRepository;
//         this.aircraftDocumentationService = aircraftDocumentationService;
//     }

//     // Obtener todos los aircrafts
//     public List<Aircraft> getAllAircrafts() {
//         return aircraftRepository.findAll();
//     }

//     // Obtener un aircraft por ID
//     public Optional<Aircraft> getAircraftById(int id) {
//         return aircraftRepository.findById(id);
//     }

//     // Crear un nueva aeronave con archivo
//     public Aircraft createWithFile(Aircraft aircraft, MultipartFile imageFile) throws IOException {
//         Aircraft savedAircraft = aircraftRepository.save(aircraft);

//         if (imageFile != null && !imageFile.isEmpty()) {
//             Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
//             Path profileDir = uploadDir.resolve(Paths.get("aircraft", savedAircraft.getId().toString(), "profile")).normalize();
//             Files.createDirectories(profileDir);

//             String filename = buildProfileFilename(savedAircraft.getId(), imageFile.getOriginalFilename());
//             Path target = profileDir.resolve(filename);
//             imageFile.transferTo(target.toFile());

//             savedAircraft.setImagePath(
//                     Paths.get("aircraft", savedAircraft.getId().toString(), "profile", filename)
//                             .toString()
//                             .replace("\\", "/")
//             );
//         }

//         return aircraftRepository.save(savedAircraft);
//     }

//     public Aircraft createWithFileAndDocumentation(
//             Aircraft aircraft,
//             MultipartFile imageFile,
//             List<AircraftDocumentationUploadRequest> documentations,
//             MultipartHttpServletRequest multipartRequest
//     ) throws IOException {
//         Aircraft savedAircraft = createWithFile(aircraft, imageFile);
//         aircraftDocumentationService.saveFromUploadRequests(savedAircraft, documentations, multipartRequest);
//         return savedAircraft;
//     }

//     public Aircraft updateWithFile(
//         Integer id, 
//         Aircraft updatedAircraft, 
//         MultipartFile imageFile, 
//         boolean removeImage,
//         boolean mtomPresent, 
//         boolean wingspanPresent,
//         boolean maxSpeedPresent,
//         boolean impactEnergyPresent,
//         boolean privatelyBuiltPresent,
//         boolean hasParachutePresent,
//         boolean hasEnsurancePresent,
//         boolean hasFTSPresent,
//         boolean cautivePresent,
//         boolean accessoriesPresent
//     ) throws IOException {
        
//         Aircraft aircraft = aircraftRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Aircraft not found with id: " + id));

//         // --- Campos de Texto (se mantienen si no llegan nulos) ---
//         if (updatedAircraft.getManufacturer() != null) aircraft.setManufacturer(updatedAircraft.getManufacturer());
//         if (updatedAircraft.getModel() != null) aircraft.setModel(updatedAircraft.getModel());
//         if (updatedAircraft.getSerialNumber() != null) aircraft.setSerialNumber(updatedAircraft.getSerialNumber());
//         if (updatedAircraft.getAircraftClass() != null) aircraft.setAircraftClass(updatedAircraft.getAircraftClass());
//         if (updatedAircraft.getConfig() != null) aircraft.setConfig(updatedAircraft.getConfig());
//         if (updatedAircraft.getHasCamera() != null) aircraft.setHasCamera(updatedAircraft.getHasCamera());

        
//         // MTOM
//         if (updatedAircraft.getMtom() != null) {
//             aircraft.setMtom(updatedAircraft.getMtom());
//         } else if (mtomPresent) {
//             aircraft.setMtom(null);
//         }

//         // WINGSPAN
//         if (updatedAircraft.getWingspan() != null) {
//             aircraft.setWingspan(updatedAircraft.getWingspan());
//         } else if (wingspanPresent) {
//             aircraft.setWingspan(null);
//         }

//         // MAX SPEED
//         if (updatedAircraft.getMaxSpeed() != null) {
//             aircraft.setMaxSpeed(updatedAircraft.getMaxSpeed());
//         } else if (maxSpeedPresent) {
//             aircraft.setMaxSpeed(null);
//         }

//         // IMPACT ENERGY
//         if (updatedAircraft.getImpactEnergy() != null) {
//             aircraft.setImpactEnergy(updatedAircraft.getImpactEnergy());
//         } else if (impactEnergyPresent) {
//             aircraft.setImpactEnergy(null);
//         }

//         // Privately built
//         if (updatedAircraft.getPrivatelyBuilt() != null) {
//             aircraft.setPrivatelyBuilt(updatedAircraft.getPrivatelyBuilt());
//         } else if (privatelyBuiltPresent) {
//             aircraft.setPrivatelyBuilt(null);
//         }

//         // Has parachute
//         if (updatedAircraft.getHasParachute() != null) {
//             aircraft.setHasParachute(updatedAircraft.getHasParachute());
//         } else if (hasParachutePresent) {
//             aircraft.setHasParachute(null);
//         }

//         // Has insurance (ensurance in current model)
//         if (updatedAircraft.getHasEnsurance() != null) {
//             aircraft.setHasEnsurance(updatedAircraft.getHasEnsurance());
//         } else if (hasEnsurancePresent) {
//             aircraft.setHasEnsurance(null);
//         }

//         // Has FTS
//         if (updatedAircraft.getHasFTS() != null) {
//             aircraft.setHasFTS(updatedAircraft.getHasFTS());
//         } else if (hasFTSPresent) {
//             aircraft.setHasFTS(null);
//         }

//         // Cautive selection status
//         if (updatedAircraft.getCautive() != null) {
//             aircraft.setCautive(updatedAircraft.getCautive());
//         } else if (cautivePresent) {
//             aircraft.setCautive(null);
//         }

//         // Accessories text
//         if (updatedAircraft.getAccessories() != null) {
//             aircraft.setAccessories(updatedAircraft.getAccessories());
//         } else if (accessoriesPresent) {
//             aircraft.setAccessories(null);
//         }

//         // --- Lógica de Imagen ---
//         Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
//         Path profileDir = uploadDir.resolve(Paths.get("aircraft", aircraft.getId().toString(), "profile")).normalize();
//         String oldImage = aircraft.getImagePath();

//         if (removeImage) {
//             deleteExistingImage(uploadDir, oldImage);
//             aircraft.setImagePath(null);
//         } else if (imageFile != null && !imageFile.isEmpty()) {
//             Files.createDirectories(profileDir);
//             deleteExistingImage(uploadDir, oldImage);

//             String filename = buildProfileFilename(aircraft.getId(), imageFile.getOriginalFilename());
//             Path target = profileDir.resolve(filename);
//             imageFile.transferTo(target.toFile());

//             aircraft.setImagePath(
//                     Paths.get("aircraft", aircraft.getId().toString(), "profile", filename)
//                             .toString()
//                             .replace("\\", "/")
//             );
//         }

//         return aircraftRepository.save(aircraft);
//     }

//     private void deleteExistingImage(Path uploadDir, String oldImage) throws IOException {
//         if (oldImage == null || oldImage.isBlank()) {
//             return;
//         }

//         Path oldFile = uploadDir.resolve(oldImage).normalize();
//         if (oldFile.startsWith(uploadDir)) {
//             Files.deleteIfExists(oldFile);
//         }
//     }

//     private String buildProfileFilename(Integer aircraftId, String originalFilename) {
//         String safeName = (originalFilename == null || originalFilename.isBlank())
//                 ? "upload"
//                 : Paths.get(originalFilename).getFileName().toString();
//         int dot = safeName.lastIndexOf('.');
//         String extension = dot >= 0 ? safeName.substring(dot) : "";
//         return "aircraft_" + aircraftId + "_profile" + extension;
//     }

//     // Eliminar un aircraft por ID
//     public void deleteAircraft(int id) {
//         if (!aircraftRepository.existsById(id)) {
//             throw new RuntimeException("Aircraft no encontrado con id: " + id);
//         }
//         aircraftDocumentationService.deleteByAircraftId(id);
//         aircraftRepository.deleteById(id);
//     }
// }