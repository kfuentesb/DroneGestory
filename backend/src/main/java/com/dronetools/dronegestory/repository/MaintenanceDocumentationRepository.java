package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.MaintenanceDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaintenanceDocumentationRepository extends JpaRepository<MaintenanceDocumentation, Long> {
    Optional<MaintenanceDocumentation> findByMaintenance_MaintenanceId(Long maintenanceId);
}
