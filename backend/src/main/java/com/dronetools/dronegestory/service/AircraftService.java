package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class AircraftService {

    private final AircraftRepository aircraftRepository;

    public AircraftService(AircraftRepository aircraftRepository){
        this.aircraftRepository = aircraftRepository;
    }

    // Obtener todos los aircrafts
    public List<Aircraft> getAllAircrafts() {
        return aircraftRepository.findAll();
    }

    // Obtener un aircraft por ID
    public Optional<Aircraft> getAircraftById(int id) {
        return aircraftRepository.findById(id);
    }

//    // Crear un nuevo aircraft
//    public Aircraft createAircraft(Aircraft aircraft) {
//        return aircraftRepository.save(aircraft);
//    }

    // Crear un nueva aeronave con archivo
    public Aircraft createWithFile(Aircraft aircraft, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String originalName = imageFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "upload"
                    : Paths.get(originalName).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + safeName;
            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            imageFile.transferTo(target.toFile());
            aircraft.setImagePath(filename);
        }

        return aircraftRepository.save(aircraft);
    }

    public Aircraft updateWithFile(Integer id, Aircraft updatedAircraft, MultipartFile imageFile) throws IOException {
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft not found with id: " + id));

        // Obligatorios
        if (updatedAircraft.getManufacturer() != null) aircraft.setManufacturer(updatedAircraft.getManufacturer());
        if (updatedAircraft.getModel() != null) aircraft.setModel(updatedAircraft.getModel());
        if (updatedAircraft.getSerialNumber() != null) aircraft.setSerialNumber(updatedAircraft.getSerialNumber());
        if (updatedAircraft.getAircraftClass() != null) aircraft.setAircraftClass(updatedAircraft.getAircraftClass());
        if (updatedAircraft.getMtom() != null) aircraft.setMtom(updatedAircraft.getMtom());
        if (updatedAircraft.getWingspan() != null) aircraft.setWingspan(updatedAircraft.getWingspan());
        if (updatedAircraft.getMaxSpeed() != null) aircraft.setMaxSpeed(updatedAircraft.getMaxSpeed());
        if (updatedAircraft.getConfig() != null) aircraft.setConfig(updatedAircraft.getConfig());
        if (updatedAircraft.getImpactEnergy() != null) aircraft.setImpactEnergy(updatedAircraft.getImpactEnergy());
        if (updatedAircraft.getHasCamera() != null) aircraft.setHasCamera(updatedAircraft.getHasCamera());

        // Opcionales
        // if (updatedAircraft.getApplicantType() != null) aircraft.setApplicantType(updatedAircraft.getApplicantType());
        // if (updatedAircraft.getApplicantName() != null) aircraft.setApplicantName(updatedAircraft.getApplicantName());
        // if (updatedAircraft.getOperadorName() != null) aircraft.setOperadorName(updatedAircraft.getOperadorName());
        // if (updatedAircraft.getOperatorNumber() != null) aircraft.setOperatorNumber(updatedAircraft.getOperatorNumber());
        // if (updatedAircraft.getPrivatelyBuilt() != null) aircraft.setPrivatelyBuilt(updatedAircraft.getPrivatelyBuilt());
        // if (updatedAircraft.getMaxAutonomy() != null) aircraft.setMaxAutonomy(updatedAircraft.getMaxAutonomy());
        // if (updatedAircraft.getTether() != null) aircraft.setTether(updatedAircraft.getTether());
        // if (updatedAircraft.getCableLenght() != null) aircraft.setCableLenght(updatedAircraft.getCableLenght());
        // if (updatedAircraft.getPowerSource() != null) aircraft.setPowerSource(updatedAircraft.getPowerSource());
        // if (updatedAircraft.getPowerSourceType() != null) aircraft.setPowerSourceType(updatedAircraft.getPowerSourceType());
        // if (updatedAircraft.getAccessories() != null) aircraft.setAccessories(updatedAircraft.getAccessories());
        // if (updatedAircraft.getObservations() != null) aircraft.setObservations(updatedAircraft.getObservations());
        // if (updatedAircraft.getPurchaseDate() != null) aircraft.setPurchaseDate(updatedAircraft.getPurchaseDate());

        // --- Manejo de imagen ---
         if (imageFile != null && !imageFile.isEmpty()) {
             Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
             Files.createDirectories(uploadDir);

             // Guarda nombre anterior para borrado
             String oldImage = aircraft.getImagePath();

             String originalName = imageFile.getOriginalFilename();
             String safeName = (originalName == null || originalName.isBlank())
                     ? "upload"
                     : Paths.get(originalName).getFileName().toString();

             // Ejemplo: modelo_serie_nombreImagen.jpg
             String filename = aircraft.getModel() + "_" + aircraft.getSerialNumber() + "_" + safeName;

             Path target = uploadDir.resolve(filename);
             imageFile.transferTo(target.toFile());

             aircraft.setImagePath(filename);

             // Elimina la imagen anterior, si existe
             if (oldImage != null && !oldImage.isBlank()) {
                 Path oldFile = uploadDir.resolve(oldImage).normalize();
                 Files.deleteIfExists(oldFile);
             }
         }

        return aircraftRepository.save(aircraft);
    }


//    // Actualizar un aircraft existente
//    public Aircraft updateAircraft(int id, Aircraft updatedAircraft) {
//        return aircraftRepository.findById(id)
//                .map(existingAircraft -> {
//                    existingAircraft.setModel(updatedAircraft.getModel());
//                    existingAircraft.setModel(updatedAircraft.getModel());
////                    existingAircraft.setCapacity(updatedAircraft.getCapacity());
//                    return aircraftRepository.save(existingAircraft);
//                })
//                .orElseThrow(() -> new RuntimeException("Aircraft no encontrado con id: " + id));
//    }



    // Eliminar un aircraft por ID
    public void deleteAircraft(int id) {
        if (!aircraftRepository.existsById(id)) {
            throw new RuntimeException("Aircraft no encontrado con id: " + id);
        }
        aircraftRepository.deleteById(id);
    }
}