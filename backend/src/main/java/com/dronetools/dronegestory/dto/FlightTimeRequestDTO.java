package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record FlightTimeRequestDTO(
        Long aircraftId,
        Long operationId,
        LocalDate flightDate,
        Integer durationMinutes
) {
}
