package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PilotCertificationRepository extends JpaRepository<PilotCertification, PilotCertificationId> {
}