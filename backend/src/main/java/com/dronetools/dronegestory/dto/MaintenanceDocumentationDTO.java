package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record MaintenanceDocumentationDTO(
        Long id,
        Long maintenanceId,
        String documentationType,
        String documentationName,
        String filePath,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
