package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.repository.AircraftRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class AircraftService {

    private final AircraftRepository aircraftRepository;
    private final AircraftDocumentationService aircraftDocumentationService;

    public AircraftService(
            AircraftRepository aircraftRepository,
            AircraftDocumentationService aircraftDocumentationService
    ){
        this.aircraftRepository = aircraftRepository;
        this.aircraftDocumentationService = aircraftDocumentationService;
    }

    // Obtener todos los aircrafts
    public List<Aircraft> getAllAircrafts() {
        return aircraftRepository.findAll();
    }

    // Obtener un aircraft por ID
    public Optional<Aircraft> getAircraftById(int id) {
        return aircraftRepository.findById(id);
    }

    // Crear un nueva aeronave con archivo
    public Aircraft createWithFile(Aircraft aircraft, MultipartFile imageFile) throws IOException {
        Aircraft savedAircraft = aircraftRepository.save(aircraft);

        if (imageFile != null && !imageFile.isEmpty()) {
            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path profileDir = uploadDir.resolve(Paths.get("aircraft", savedAircraft.getId().toString(), "profile")).normalize();
            Files.createDirectories(profileDir);

            String filename = buildProfileFilename(savedAircraft.getId(), imageFile.getOriginalFilename());
            Path target = profileDir.resolve(filename);
            imageFile.transferTo(target.toFile());

            savedAircraft.setImagePath(
                    Paths.get("aircraft", savedAircraft.getId().toString(), "profile", filename)
                            .toString()
                            .replace("\\", "/")
            );
        }

        return aircraftRepository.save(savedAircraft);
    }

    public Aircraft createWithFileAndDocumentation(
            Aircraft aircraft,
            MultipartFile imageFile,
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        Aircraft savedAircraft = createWithFile(aircraft, imageFile);
        aircraftDocumentationService.saveFromUploadRequests(savedAircraft, documentations, multipartRequest);
        return savedAircraft;
    }

    public Aircraft updateWithFile(
        Integer id, 
        Aircraft updatedAircraft, 
        MultipartFile imageFile, 
        boolean removeImage,
        boolean mtomPresent, 
        boolean wingspanPresent,
        boolean maxSpeedPresent,
        boolean impactEnergyPresent
    ) throws IOException {
        
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft not found with id: " + id));

        // --- Campos de Texto (se mantienen si no llegan nulos) ---
        if (updatedAircraft.getManufacturer() != null) aircraft.setManufacturer(updatedAircraft.getManufacturer());
        if (updatedAircraft.getModel() != null) aircraft.setModel(updatedAircraft.getModel());
        if (updatedAircraft.getSerialNumber() != null) aircraft.setSerialNumber(updatedAircraft.getSerialNumber());
        if (updatedAircraft.getAircraftClass() != null) aircraft.setAircraftClass(updatedAircraft.getAircraftClass());
        if (updatedAircraft.getConfig() != null) aircraft.setConfig(updatedAircraft.getConfig());
        if (updatedAircraft.getHasCamera() != null) aircraft.setHasCamera(updatedAircraft.getHasCamera());

        
        // MTOM
        if (updatedAircraft.getMtom() != null) {
            aircraft.setMtom(updatedAircraft.getMtom());
        } else if (mtomPresent) {
            aircraft.setMtom(null);
        }

        // WINGSPAN
        if (updatedAircraft.getWingspan() != null) {
            aircraft.setWingspan(updatedAircraft.getWingspan());
        } else if (wingspanPresent) {
            aircraft.setWingspan(null);
        }

        // MAX SPEED
        if (updatedAircraft.getMaxSpeed() != null) {
            aircraft.setMaxSpeed(updatedAircraft.getMaxSpeed());
        } else if (maxSpeedPresent) {
            aircraft.setMaxSpeed(null);
        }

        // IMPACT ENERGY
        if (updatedAircraft.getImpactEnergy() != null) {
            aircraft.setImpactEnergy(updatedAircraft.getImpactEnergy());
        } else if (impactEnergyPresent) {
            aircraft.setImpactEnergy(null);
        }

        // --- Lógica de Imagen ---
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path profileDir = uploadDir.resolve(Paths.get("aircraft", aircraft.getId().toString(), "profile")).normalize();
        String oldImage = aircraft.getImagePath();

        if (removeImage) {
            deleteExistingImage(uploadDir, oldImage);
            aircraft.setImagePath(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            Files.createDirectories(profileDir);
            deleteExistingImage(uploadDir, oldImage);

            String filename = buildProfileFilename(aircraft.getId(), imageFile.getOriginalFilename());
            Path target = profileDir.resolve(filename);
            imageFile.transferTo(target.toFile());

            aircraft.setImagePath(
                    Paths.get("aircraft", aircraft.getId().toString(), "profile", filename)
                            .toString()
                            .replace("\\", "/")
            );
        }

        return aircraftRepository.save(aircraft);
    }

    private void deleteExistingImage(Path uploadDir, String oldImage) throws IOException {
        if (oldImage == null || oldImage.isBlank()) {
            return;
        }

        Path oldFile = uploadDir.resolve(oldImage).normalize();
        if (oldFile.startsWith(uploadDir)) {
            Files.deleteIfExists(oldFile);
        }
    }

    private String buildProfileFilename(Integer aircraftId, String originalFilename) {
        String safeName = (originalFilename == null || originalFilename.isBlank())
                ? "upload"
                : Paths.get(originalFilename).getFileName().toString();
        int dot = safeName.lastIndexOf('.');
        String extension = dot >= 0 ? safeName.substring(dot) : "";
        return "aircraft_" + aircraftId + "_profile" + extension;
    }

    // Eliminar un aircraft por ID
    public void deleteAircraft(int id) {
        if (!aircraftRepository.existsById(id)) {
            throw new RuntimeException("Aircraft no encontrado con id: " + id);
        }
        aircraftDocumentationService.deleteByAircraftId(id);
        aircraftRepository.deleteById(id);
    }
}
