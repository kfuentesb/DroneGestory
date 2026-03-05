package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Aircraft;

import java.util.List;
import java.util.Optional;

public interface AircraftService {
    List<Aircraft> findAll();
    Optional<Aircraft> findById(Integer id);
    Aircraft save(Aircraft aircraft);
    void deleteById(Integer id);
}