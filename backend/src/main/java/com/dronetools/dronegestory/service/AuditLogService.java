package com.dronetools.dronegestory.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final Path AUDIT_LOG_PATH = Paths.get("AuditLog.txt").toAbsolutePath().normalize();

    public void record(String functionName, Long entityId, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null && authentication.getName() != null
                ? authentication.getName()
                : "system";

        String line = String.format(
                "%s | usuario=%s | funcion=%s | id=%s | detalle=%s%n",
                LocalDateTime.now().format(TIMESTAMP_FORMAT),
                username,
                functionName,
                entityId,
                sanitize(details)
        );

        try {
            Path parent = AUDIT_LOG_PATH.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.writeString(
                    AUDIT_LOG_PATH,
                    line,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            log.error("No se pudo escribir en el audit log {}", AUDIT_LOG_PATH, e);
        }
    }

    private String sanitize(String details) {
        if (details == null || details.isBlank()) {
            return "-";
        }
        return details.replace(System.lineSeparator(), " ").replace("\n", " ").replace("\r", " ").trim();
    }
}
