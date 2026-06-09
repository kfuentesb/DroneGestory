package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.service.AuditLogService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

record AvailableAuditLogMonth(int year, int month, String displayName) {}
record AvailableAuditLogsResponse(List<Integer> years, Map<Integer, List<AvailableAuditLogMonth>> monthsByYear) {}

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    @Value("${APP_AUDIT_LOGS_ROOT:AuditLogs}")
    private String auditLogsRoot;

    private final AuditLogService auditLogService;

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AvailableAuditLogsResponse> listAvailable() throws IOException {
        Path auditLogsPath = Paths.get(auditLogsRoot).toAbsolutePath().normalize();
        
        if (!Files.exists(auditLogsPath)) {
            return ResponseEntity.ok(new AvailableAuditLogsResponse(Collections.emptyList(), Collections.emptyMap()));
        }

        Map<Integer, List<AvailableAuditLogMonth>> monthsByYear = new TreeMap<>(Collections.reverseOrder());
        List<Integer> years = new ArrayList<>();

        try (Stream<Path> yearDirs = Files.list(auditLogsPath)) {
            for (Path yearDir : yearDirs.toList()) {
                if (!Files.isDirectory(yearDir)) continue;

                try {
                    int year = Integer.parseInt(yearDir.getFileName().toString());
                    List<AvailableAuditLogMonth> months = new ArrayList<>();

                    try (Stream<Path> monthDirs = Files.list(yearDir)) {
                        for (Path monthDir : monthDirs.toList()) {
                            if (!Files.isDirectory(monthDir)) continue;

                            try {
                                int month = Integer.parseInt(monthDir.getFileName().toString());
                                String displayName = String.format("%d-%02d", year, month);
                                months.add(new AvailableAuditLogMonth(year, month, displayName));
                            } catch (NumberFormatException ignore) {
                            }
                        }
                    }

                    if (!months.isEmpty()) {
                        months.sort((a, b) -> Integer.compare(b.month(), a.month()));
                        monthsByYear.put(year, months);
                        if (!years.contains(year)) {
                            years.add(year);
                        }
                    }
                } catch (NumberFormatException ignore) {
                }
            }
        }

        Collections.sort(years, Collections.reverseOrder());
        return ResponseEntity.ok(new AvailableAuditLogsResponse(years, monthsByYear));
    }

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> download(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month
    ) throws IOException {
        if (year == null || month == null) {
            return ResponseEntity.badRequest().build();
        }

        Path auditLogPath = getAuditLogPath(year, month);
        if (!Files.exists(auditLogPath) || !Files.isReadable(auditLogPath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Resource resource = new UrlResource(auditLogPath.toUri());
        String contentType = Files.probeContentType(auditLogPath);
        if (contentType == null) {
            contentType = MediaType.TEXT_PLAIN_VALUE;
        }

        String fileName = String.format("AuditLog-%04d-%02d.csv", year, month);
        auditLogService.record(
                "DESCARGAR_AUDITLOG",
                null,
                "year=" + year + ", month=" + month + ", fileName=" + fileName
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    private Path getAuditLogPath(Integer year, Integer month) {
        if (year == null || month == null) {
            // Fallback a la estructura antigua por compatibilidad
            return Paths.get(auditLogsRoot, "AuditLog.csv").toAbsolutePath().normalize();
        }
        String yearStr = String.format("%04d", year);
        String monthStr = String.format("%02d", month);
        String fileName = String.format("AuditLog-%s-%s.csv", yearStr, monthStr);
        return Paths.get(auditLogsRoot, yearStr, monthStr, fileName).toAbsolutePath().normalize();
    }
}
