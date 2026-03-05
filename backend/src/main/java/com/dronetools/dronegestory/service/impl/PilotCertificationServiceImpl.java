package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;
import com.dronetools.dronegestory.repository.PilotCertificationRepository;
import com.dronetools.dronegestory.service.PilotCertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PilotCertificationServiceImpl implements PilotCertificationService {

    private final PilotCertificationRepository repository;

    @Override
    public List<PilotCertification> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<PilotCertification> findById(PilotCertificationId id) {
        return repository.findById(id);
    }

    @Override
    public PilotCertification save(PilotCertification pilotCertification) {
        return repository.save(pilotCertification);
    }

    @Override
    public void deleteById(PilotCertificationId id) {
        repository.deleteById(id);
    }
}