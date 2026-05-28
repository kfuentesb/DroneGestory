package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.BackupRunResponse;
import com.dronetools.dronegestory.dto.BackupSettingsRequest;
import com.dronetools.dronegestory.dto.BackupSettingsResponse;
import com.dronetools.dronegestory.service.BackupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backups")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public BackupSettingsResponse getSettings() {
        return backupService.findSettings();
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public BackupSettingsResponse updateSettings(@Valid @RequestBody BackupSettingsRequest request) {
        return backupService.updateSettings(request);
    }

    @PostMapping("/run")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public BackupRunResponse runBackup() {
        return backupService.runManualBackup();
    }
}
