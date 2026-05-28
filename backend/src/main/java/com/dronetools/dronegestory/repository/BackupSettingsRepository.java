package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.BackupSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackupSettingsRepository extends JpaRepository<BackupSettings, Integer> {
}
