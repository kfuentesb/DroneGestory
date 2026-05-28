package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record BackupRunResponse(
        LocalDate backupDate,
        String backupPath,
        String databaseFile,
        boolean uploadsCopied,
        boolean auditLogsCopied
) {
}
