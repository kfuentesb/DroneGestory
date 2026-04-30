package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.SentMail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SentMailRepository extends JpaRepository<SentMail, Long> {
}
