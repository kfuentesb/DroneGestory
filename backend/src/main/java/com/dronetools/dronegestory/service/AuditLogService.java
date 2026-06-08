package com.dronetools.dronegestory.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter HOUR_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Value("${APP_AUDIT_LOGS_ROOT:AuditLogs}")
    private String auditLogsRoot;

    public void record(String functionName, Long entityId, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null && authentication.getName() != null
                ? authentication.getName()
                : "system";

        // Use UTC time for the timestamp and the hour field
        ZonedDateTime nowUtc = ZonedDateTime.now(ZoneOffset.UTC);
        String timestamp = nowUtc.format(TIMESTAMP_FORMAT);
        String utcHourField = "UTC-0|" + nowUtc.format(HOUR_FORMAT);

        String userEsc = csvEscape(username);
        String funcEsc = csvEscape(functionName);
        String idEsc = csvEscape(entityId == null ? "" : entityId.toString());
        String detailsEsc = csvEscape(sanitize(details));
        String tsEsc = csvEscape(timestamp);
        String hourEsc = csvEscape(utcHourField);

        String line = String.format("%s,%s,%s,%s,%s,%s%n", tsEsc, hourEsc, userEsc, funcEsc, idEsc, detailsEsc);

        try {
            Path auditLogPath = getAuditLogPath();
            Path parent = auditLogPath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            // If file doesn't exist, write a header first
            if (Files.notExists(auditLogPath)) {
                String header = "timestamp,utc_hour,usuario,funcion,id,detalle" + System.lineSeparator();
                Files.writeString(auditLogPath, header, StandardCharsets.UTF_8, StandardOpenOption.CREATE);
            }

            Files.writeString(
                    auditLogPath,
                    line,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            log.error("No se pudo escribir en el audit log {}", getAuditLogPath(), e);
        }
    }

    private Path getAuditLogPath() {
        LocalDate today = LocalDate.now();
        String year = String.format("%04d", today.getYear());
        String month = String.format("%02d", today.getMonthValue());
        String fileName = String.format("AuditLog-%s-%s.csv", year, month);
        return Paths.get(auditLogsRoot, year, month, fileName).toAbsolutePath().normalize();
    }

    private String sanitize(String details) {
        if (details == null || details.isBlank()) {
            return "-";
        }
        return details.replace(System.lineSeparator(), " ").replace("\n", " ").replace("\r", " ").trim();
    }

    private String csvEscape(String s) {
        if (s == null) return "\"\"";
        String escaped = s.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
