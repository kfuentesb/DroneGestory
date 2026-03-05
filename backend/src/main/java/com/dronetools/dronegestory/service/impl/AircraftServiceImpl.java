package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.service.AircraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AircraftServiceImpl implements AircraftService {

    private final AircraftRepository repository;

    @Override
    public List<Aircraft> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Aircraft> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Aircraft save(Aircraft aircraft) {
        return repository.save(aircraft);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}