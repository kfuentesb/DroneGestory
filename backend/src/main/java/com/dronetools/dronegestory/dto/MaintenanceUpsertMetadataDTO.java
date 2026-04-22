package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record MaintenanceUpsertMetadataDTO(
        Long aircraftId,
        String reviewType,
        Integer monthsRequired,
        Integer hoursFlightRequired,
        LocalDate maintenanceDate,
        LocalDate nextMaintenanceDate,
        String comments,
        MaintenanceDocumentationMetadataDTO documentation,
        Boolean removeDocumentation
) {
}
