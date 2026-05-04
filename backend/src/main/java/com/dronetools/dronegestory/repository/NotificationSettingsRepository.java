package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.NotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Integer> {
}
