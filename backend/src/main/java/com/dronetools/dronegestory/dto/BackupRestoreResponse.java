package com.dronetools.dronegestory.dto;

public record BackupRestoreResponse(
        String restoredBackupName,
        boolean preRestoreBackupCreated,
        String preRestoreBackupPath,
        String restoredDatabaseFile,
        boolean uploadsRestored,
        boolean auditLogsRestored
) {
}
