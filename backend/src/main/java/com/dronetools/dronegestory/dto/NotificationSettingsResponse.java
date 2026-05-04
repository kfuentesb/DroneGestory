package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record NotificationSettingsResponse(
        Integer scheduleHour,
        Integer scheduleMinute,
        Integer certificateFirstDaysAhead,
        Integer certificateSecondDaysAhead,
        Integer operationDaysAhead,
        Integer maintenanceDaysAhead,
        Integer eventDaysAhead,
        LocalDate lastRunDate
) {
}
