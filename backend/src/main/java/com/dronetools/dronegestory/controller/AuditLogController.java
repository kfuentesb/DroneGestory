package com.dronetools.dronegestory.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/audit-log")
public class AuditLogController {

    @Value("${APP_AUDIT_LOGS_ROOT:AuditLogs}")
    private String auditLogsRoot;

    @Value("${APP_LEGACY_AUDIT_LOG_CSV:AuditLog.csv}")
    private String legacyAuditLogCsv;

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> download() throws IOException {
        Path auditLogPath = getAuditLogPath();
        if (!Files.exists(auditLogPath) || !Files.isReadable(auditLogPath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Resource resource = new UrlResource(auditLogPath.toUri());
        String contentType = Files.probeContentType(auditLogPath);
        if (contentType == null) {
            contentType = MediaType.TEXT_PLAIN_VALUE;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"AuditLog.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    private Path getAuditLogPath() {
        Path configuredPath = Paths.get(auditLogsRoot, "AuditLog.csv").toAbsolutePath().normalize();
        if (Files.exists(configuredPath)) {
            return configuredPath;
        }
        return Paths.get(legacyAuditLogCsv).toAbsolutePath().normalize();
    }
}
