package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record BackupSettingsResponse(
        Integer scheduleDay,
        Integer scheduleHour,
        LocalDate lastRunDate,
        String lastBackupPath,
        Long lastBackupSizeBytes
) {
}
