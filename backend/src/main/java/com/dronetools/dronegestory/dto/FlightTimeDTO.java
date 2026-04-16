package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record FlightTimeDTO(
        Long id,
        Long aircraftId,
        String aircraftManufacturer,
        String aircraftModel,
        String aircraftSerialNumber,
        Long operationId,
        String operationReference,
        LocalDate flightDate,
        Integer durationMinutes,
        Double flightHours,
        Integer totalFlightTimeMinutes,
        Double totalFlightHours,
        FlightTimeDocumentationDTO documentation
) {
}
