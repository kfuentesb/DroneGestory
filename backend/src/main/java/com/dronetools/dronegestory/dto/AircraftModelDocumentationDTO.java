package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record AircraftModelDocumentationDTO(
        Long id,
        Long aircraftModelId,
        String documentationType,
        String documentationName,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
