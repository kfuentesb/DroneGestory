package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.repository.PilotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PilotService {

    private final PilotRepository pilotRepository;

    public PilotService(PilotRepository pilotRepository) {
        this.pilotRepository = pilotRepository;
    }

    // Get all pilots
    public List<Pilot> getAllPilots() {
        return pilotRepository.findAll();
    }

    // Get a pilot by ID
    public Optional<Pilot> getPilotById(int id) {
        return pilotRepository.findById(id);
    }

    // Create a new pilot
    public Pilot createPilot(Pilot pilot) {
        return pilotRepository.save(pilot);
    }

    // Update an existing pilot
    public Pilot updatePilot(int id, Pilot updatedPilot) {
        return pilotRepository.findById(id)
                .map(existingPilot -> {
                    existingPilot.setFirstName(updatedPilot.getFirstName());
                    existingPilot.setLastName(updatedPilot.getLastName());
                    existingPilot.setUsername(updatedPilot.getUsername());
                    existingPilot.setPassword(updatedPilot.getPassword());
                    existingPilot.setEmail(updatedPilot.getEmail());
                    existingPilot.setPhoneNumber(updatedPilot.getPhoneNumber());
                    existingPilot.setImagePath(updatedPilot.getImagePath());
                    // Add pilot-specific fields here if you have any
                    return pilotRepository.save(existingPilot);
                })
                .orElseThrow(() -> new RuntimeException("Pilot not found with id: " + id));
    }

    // Delete a pilot by ID
    public void deletePilot(int id) {
        if (!pilotRepository.existsById(id)) {
            throw new RuntimeException("Pilot not found with id: " + id);
        }
        pilotRepository.deleteById(id);
    }
}