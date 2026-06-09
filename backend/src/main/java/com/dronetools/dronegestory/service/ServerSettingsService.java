package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.ServerAttributesRequest;
import com.dronetools.dronegestory.dto.ServerAttributesResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class ServerSettingsService {

    private static final String MAX_FILE_SIZE_KEY = "APP_MAX_FILE_SIZE_MB";
    private static final String MAIL_KEY = "EMAIL_USER";
    private static final String SMTPS_KEY = "EMAIL_PASSWORD";

    private final Environment environment;

    @Value("${APP_MAX_FILE_SIZE_MB:500}")
    private Integer currentMaxFileSizeMb;

    @Value("${EMAIL_USER:}")
    private String currentMail;

    @Value("${EMAIL_PASSWORD:}")
    private String currentSmtpsKey;

    public ServerSettingsService(Environment environment) {
        this.environment = environment;
    }

    public ServerAttributesResponse getAttributes() {
        return new ServerAttributesResponse(
                resolveCurrentMaxFileSizeMb(),
                resolveCurrentMail(),
                resolveCurrentSmtpsKey()
        );
    }

    public ServerAttributesResponse updateAttributes(ServerAttributesRequest request) {
        Path envFile = resolveEnvFile();
        Map<String, String> updates = Map.of(
                MAX_FILE_SIZE_KEY, String.valueOf(request.maxFileSizeMb()),
                MAIL_KEY, request.mail().trim(),
                SMTPS_KEY, request.smtpsKey().trim()
        );

        try {
            writeEnvFile(envFile, updates);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo actualizar el archivo .env: " + e.getMessage(), e);
        }

        currentMaxFileSizeMb = request.maxFileSizeMb();
        currentMail = request.mail().trim();
        currentSmtpsKey = request.smtpsKey().trim();

        System.setProperty(MAX_FILE_SIZE_KEY, String.valueOf(currentMaxFileSizeMb));
        System.setProperty(MAIL_KEY, currentMail);
        System.setProperty(SMTPS_KEY, currentSmtpsKey);

        return getAttributes();
    }

    private Integer resolveCurrentMaxFileSizeMb() {
        Integer value = environment.getProperty(MAX_FILE_SIZE_KEY, Integer.class);
        return value != null ? value : currentMaxFileSizeMb;
    }

    private String resolveCurrentMail() {
        String value = environment.getProperty(MAIL_KEY);
        return value != null ? value : currentMail;
    }

    private String resolveCurrentSmtpsKey() {
        String value = environment.getProperty(SMTPS_KEY);
        return value != null ? value : currentSmtpsKey;
    }

    private Path resolveEnvFile() {
        Path current = Paths.get("").toAbsolutePath().normalize();
        while (current != null) {
            Path candidate = current.resolve(".env");
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        return Paths.get(".env").toAbsolutePath().normalize();
    }

    private void writeEnvFile(Path envFile, Map<String, String> updates) throws IOException {
        List<String> lines = Files.exists(envFile)
                ? Files.readAllLines(envFile, StandardCharsets.UTF_8)
                : new ArrayList<>();
        Map<String, Boolean> seen = new HashMap<>();
        List<String> rewritten = new ArrayList<>(lines.size() + updates.size());

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                rewritten.add(line);
                continue;
            }

            int separatorIndex = line.indexOf('=');
            if (separatorIndex <= 0) {
                rewritten.add(line);
                continue;
            }

            String key = line.substring(0, separatorIndex).trim();
            String value = updates.get(key);
            if (value != null) {
                rewritten.add(key + "=" + value);
                seen.put(key, true);
            } else {
                rewritten.add(line);
            }
        }

        for (Map.Entry<String, String> entry : updates.entrySet()) {
            if (!seen.containsKey(entry.getKey())) {
                rewritten.add(entry.getKey() + "=" + entry.getValue());
            }
        }

        Files.write(envFile, rewritten, StandardCharsets.UTF_8);
    }
}
