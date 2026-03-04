package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Pilot;
import java.util.List;
import java.util.Optional;

public interface PilotService {
    List<Pilot> findAll();
    Optional<Pilot> findById(Integer id);
    Pilot save(Pilot pilot);
    void deleteById(Integer id);
}