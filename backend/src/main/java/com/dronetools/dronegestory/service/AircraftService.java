package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.repository.AircraftRepository;
import org.springframework.stereotype.Service;

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

    // Crear un nuevo aircraft
    public Aircraft createAircraft(Aircraft aircraft) {
        return aircraftRepository.save(aircraft);
    }

    // Actualizar un aircraft existente
    public Aircraft updateAircraft(int id, Aircraft updatedAircraft) {
        return aircraftRepository.findById(id)
                .map(existingAircraft -> {
                    existingAircraft.setName(updatedAircraft.getName());
                    existingAircraft.setModel(updatedAircraft.getModel());
//                    existingAircraft.setCapacity(updatedAircraft.getCapacity());
                    return aircraftRepository.save(existingAircraft);
                })
                .orElseThrow(() -> new RuntimeException("Aircraft no encontrado con id: " + id));
    }

    // Eliminar un aircraft por ID
    public void deleteAircraft(int id) {
        if (!aircraftRepository.existsById(id)) {
            throw new RuntimeException("Aircraft no encontrado con id: " + id);
        }
        aircraftRepository.deleteById(id);
    }
}