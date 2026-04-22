package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record MaintenanceDocumentationMetadataDTO(
        String documentationType,
        String documentationLabel,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
