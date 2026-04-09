package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record AircraftDocumentationDTO(
        Integer id,
        Integer aircraftId,
        String documentationType,
        String documentationName,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
