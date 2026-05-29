package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.BackupRunResponse;
import com.dronetools.dronegestory.dto.BackupRestoreResponse;
import com.dronetools.dronegestory.dto.BackupSettingsRequest;
import com.dronetools.dronegestory.dto.BackupSettingsResponse;
import com.dronetools.dronegestory.service.BackupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/restore", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public BackupRestoreResponse restoreBackup(
            @RequestParam("backupFile") MultipartFile backupFile,
            @RequestParam(value = "saveCurrentBeforeRestore", defaultValue = "false") boolean saveCurrentBeforeRestore
    ) {
        return backupService.restoreBackup(backupFile, saveCurrentBeforeRestore);
    }
}
