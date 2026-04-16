package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record FlightTimeDocumentationDTO(
        Long id,
        Long flightTimeId,
        String documentationType,
        String documentationName,
        String filePath,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
