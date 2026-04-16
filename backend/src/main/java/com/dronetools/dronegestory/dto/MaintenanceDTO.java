package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record MaintenanceDTO(
        Long id,
        Long aircraftId,
        String aircraftClass,
        String aircraftManufacturer,
        String aircraftModel,
        String aircraftSerialNumber,
        Integer aircraftFlightMinutes,
        String reviewType,
        Integer monthsRequired,
        Integer hoursFlightRequired,
        LocalDate maintenanceDate,
        String comments
) {
}
