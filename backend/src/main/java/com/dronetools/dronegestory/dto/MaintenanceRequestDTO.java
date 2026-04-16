package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record MaintenanceRequestDTO(
        Long aircraftId,
        String reviewType,
        Integer monthsRequired,
        Integer hoursFlightRequired,
        LocalDate maintenanceDate,
        String comments
) {
}
