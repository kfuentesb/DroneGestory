package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificationRepository extends JpaRepository<Certification, Integer> {
}