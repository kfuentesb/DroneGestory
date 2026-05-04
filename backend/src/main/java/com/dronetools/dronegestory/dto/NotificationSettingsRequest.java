package com.dronetools.dronegestory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record NotificationSettingsRequest(
        @NotNull @Min(0) @Max(23) Integer scheduleHour,
        @NotNull @Min(0) @Max(59) Integer scheduleMinute,
        @NotNull @Min(0) @Max(3650) Integer certificateFirstDaysAhead,
        @NotNull @Min(0) @Max(3650) Integer certificateSecondDaysAhead,
        @NotNull @Min(0) @Max(3650) Integer operationDaysAhead,
        @NotNull @Min(0) @Max(3650) Integer maintenanceDaysAhead,
        @NotNull @Min(0) @Max(3650) Integer eventDaysAhead
) {
}
