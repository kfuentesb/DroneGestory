package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.repository.PilotRepository;
import com.dronetools.dronegestory.service.PilotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PilotServiceImpl implements PilotService {

    private final PilotRepository repository;

    @Override
    public List<Pilot> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Pilot> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Pilot save(Pilot pilot) {
        return repository.save(pilot);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}