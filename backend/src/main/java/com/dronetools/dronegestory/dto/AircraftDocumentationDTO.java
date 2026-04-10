package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record AircraftDocumentationDTO(
        Long id,
        Long aircraftId,
        String documentationType,
        String documentationName,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
