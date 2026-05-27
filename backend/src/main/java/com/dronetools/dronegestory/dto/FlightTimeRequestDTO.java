package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record FlightTimeRequestDTO(
        Long aircraftId,
        String operationCodigo,
        LocalDate flightDate,
        Integer durationMinutes,
        String comments
) {
}
