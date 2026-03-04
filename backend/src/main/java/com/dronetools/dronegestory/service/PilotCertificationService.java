package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;

import java.util.List;
import java.util.Optional;

public interface PilotCertificationService {
    List<PilotCertification> findAll();
    Optional<PilotCertification> findById(PilotCertificationId id);
    PilotCertification save(PilotCertification pilotCertification);
    void deleteById(PilotCertificationId id);
}