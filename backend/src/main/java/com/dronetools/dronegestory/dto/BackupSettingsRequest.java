package com.dronetools.dronegestory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record BackupSettingsRequest(
        @NotNull @Min(1) @Max(31) Integer scheduleDay
) {
}
