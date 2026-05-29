package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.BackupRunResponse;
import com.dronetools.dronegestory.dto.BackupRestoreResponse;
import com.dronetools.dronegestory.dto.BackupSettingsRequest;
import com.dronetools.dronegestory.dto.BackupSettingsResponse;
import com.dronetools.dronegestory.model.BackupSettings;
import com.dronetools.dronegestory.repository.BackupSettingsRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BackupService {

    private static final int SETTINGS_ID = 1;
    private static final ZoneId MADRID_ZONE = ZoneId.of("Europe/Madrid");
    private static final Pattern JDBC_POSTGRES_PATTERN = Pattern.compile("^jdbc:postgresql://([^/:?]+)(?::(\\d+))?/([^?]+).*$");

    private final BackupSettingsRepository backupSettingsRepository;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Value("${APP_BACKUPS_ROOT:backups}")
    private String backupsRoot;

    @Value("${APP_UPLOADS_ROOT:uploads}")
    private String uploadsRoot;

    @Value("${APP_AUDIT_LOGS_ROOT:AuditLogs}")
    private String auditLogsRoot;

    @Scheduled(cron = "0 0 * * * ?", zone = "Europe/Madrid")
    @Transactional
    public void runScheduledBackup() {
        ZonedDateTime now = ZonedDateTime.now(MADRID_ZONE);
        LocalDate today = now.toLocalDate();
        BackupSettings settings = getOrCreateEntity();

        if (now.getDayOfMonth() != settings.getScheduleDay()
                || now.getHour() != settings.getScheduleHour()
                || today.equals(settings.getLastRunDate())) {
            return;
        }

        runBackup(settings);
    }

    @Transactional
    public BackupSettingsResponse findSettings() {
        return toSettingsResponse(getOrCreateEntity());
    }

    @Transactional
    public BackupSettingsResponse updateSettings(BackupSettingsRequest request) {
        BackupSettings settings = getOrCreateEntity();
        settings.setScheduleDay(request.scheduleDay());
        return toSettingsResponse(backupSettingsRepository.save(settings));
    }

    @Transactional
    public BackupRunResponse runManualBackup() {
        return runBackup(getOrCreateEntity());
    }

    @Transactional
    public BackupRestoreResponse restoreBackup(MultipartFile backupFile, boolean saveCurrentBeforeRestore) {
        if (backupFile == null || backupFile.isEmpty()) {
            throw new IllegalStateException("Debes subir un archivo de backup valido.");
        }

        BackupRunResponse preRestoreBackup = null;
        if (saveCurrentBeforeRestore) {
            preRestoreBackup = runBackup(getOrCreateEntity());
        }

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("backup-restore-");
            BackupArchiveContents archiveContents = unpackBackupFile(backupFile, tempDir);

            if (archiveContents.sqlFile() == null) {
                throw new IllegalStateException("El backup no contiene un archivo SQL de base de datos.");
            }

            resetDatabaseSchema();
            restoreDatabase(archiveContents.sqlFile());
            boolean uploadsRestored = restoreDirectoryIfPresent(archiveContents.uploadsDir(), Path.of(uploadsRoot));
            boolean auditLogsRestored = restoreDirectoryIfPresent(archiveContents.auditLogsDir(), Path.of(auditLogsRoot));

            String restoredBackupName = backupFile.getOriginalFilename() == null
                    ? "backup subido"
                    : backupFile.getOriginalFilename();
            return new BackupRestoreResponse(
                    restoredBackupName,
                    preRestoreBackup != null,
                    preRestoreBackup != null ? preRestoreBackup.backupPath() : null,
                    archiveContents.sqlFile().toString(),
                    uploadsRestored,
                    auditLogsRestored
            );
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("No se pudo restaurar el backup: " + e.getMessage(), e);
        } finally {
            if (tempDir != null) {
                try {
                    deleteDirectory(tempDir);
                } catch (IOException ignored) {
                }
            }
        }
    }

    private BackupRunResponse runBackup(BackupSettings settings) {
        try {
            LocalDate backupDate = LocalDate.now(MADRID_ZONE);
            Path backupDir = Path.of(backupsRoot).toAbsolutePath().normalize().resolve(backupDate.toString());
            Path backendDir = backupDir.resolve("backend");
            Path databaseFile = backupDir.resolve("postgredatabase.sql");

            Files.createDirectories(backendDir);
            dumpDatabase(databaseFile);
            boolean uploadsCopied = copyDirectoryIfExists(Path.of(uploadsRoot), backendDir.resolve("uploads"));
            Path auditLogsDestination = backendDir.resolve("AuditLogs");
            boolean auditLogsCopied = copyDirectoryIfExists(Path.of(auditLogsRoot), auditLogsDestination);

            settings.setLastRunDate(backupDate);
            settings.setLastBackupPath(backupDir.toString());
            backupSettingsRepository.save(settings);

            return new BackupRunResponse(
                    backupDate,
                    backupDir.toString(),
                    databaseFile.toString(),
                    uploadsCopied,
                    auditLogsCopied
            );
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("No se pudo crear el backup: " + e.getMessage(), e);
        }
    }

    private boolean copyFileIfExists(Path source, Path destination) throws IOException {
        Path normalizedSource = source.toAbsolutePath().normalize();
        if (!Files.isRegularFile(normalizedSource)) {
            return false;
        }

        Files.createDirectories(destination.getParent());
        Files.copy(normalizedSource, destination, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.COPY_ATTRIBUTES);
        return true;
    }

    private void dumpDatabase(Path databaseFile) throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "pg_dump",
                "-h", connectionInfo.host(),
                "-p", connectionInfo.port(),
                "-U", datasourceUsername,
                "-d", connectionInfo.database(),
                "-f", databaseFile.toString()
        );
        processBuilder.environment().put("PGPASSWORD", datasourcePassword);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IllegalStateException("pg_dump fallo con codigo " + exitCode + ": " + output);
        }

        if (!Files.exists(databaseFile) || Files.size(databaseFile) == 0) {
            throw new IllegalStateException("pg_dump no genero un archivo SQL valido.");
        }
    }

    private void restoreDatabase(Path databaseFile) throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "psql",
                "-h", connectionInfo.host(),
                "-p", connectionInfo.port(),
                "-U", datasourceUsername,
                "-d", connectionInfo.database(),
                "-v", "ON_ERROR_STOP=1",
                "-f", databaseFile.toString()
        );
        processBuilder.environment().put("PGPASSWORD", datasourcePassword);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IllegalStateException("psql fallo con codigo " + exitCode + ": " + output);
        }
    }

    private void resetDatabaseSchema() throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "psql",
                "-h", connectionInfo.host(),
                "-p", connectionInfo.port(),
                "-U", datasourceUsername,
                "-d", connectionInfo.database(),
                "-v", "ON_ERROR_STOP=1",
                "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        );
        processBuilder.environment().put("PGPASSWORD", datasourcePassword);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IllegalStateException("No se pudo limpiar la base de datos antes de restaurar: " + output);
        }
    }

    private boolean copyDirectoryIfExists(Path source, Path destination) throws IOException {
        Path normalizedSource = source.toAbsolutePath().normalize();
        if (!Files.isDirectory(normalizedSource)) {
            return false;
        }

        deleteDirectory(destination);
        Files.createDirectories(destination);

        try (var paths = Files.walk(normalizedSource)) {
            for (Path sourcePath : paths.toList()) {
                Path targetPath = destination.resolve(normalizedSource.relativize(sourcePath).toString());
                if (Files.isDirectory(sourcePath)) {
                    Files.createDirectories(targetPath);
                } else {
                    Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.COPY_ATTRIBUTES);
                }
            }
        }
        return true;
    }

    private void deleteDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }

        try (var paths = Files.walk(directory)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                Files.deleteIfExists(path);
            }
        }
    }

    private boolean restoreDirectoryIfPresent(Path source, Path destination) throws IOException {
        if (source == null || !Files.isDirectory(source)) {
            return false;
        }

        deleteDirectory(destination);
        Files.createDirectories(destination);

        try (var paths = Files.walk(source)) {
            for (Path sourcePath : paths.toList()) {
                Path targetPath = destination.resolve(source.relativize(sourcePath).toString());
                if (Files.isDirectory(sourcePath)) {
                    Files.createDirectories(targetPath);
                } else {
                    Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.COPY_ATTRIBUTES);
                }
            }
        }
        return true;
    }

    private BackupArchiveContents unpackBackupFile(MultipartFile backupFile, Path tempDir) throws IOException {
        String originalName = backupFile.getOriginalFilename() == null ? "" : backupFile.getOriginalFilename().toLowerCase();
        Path sourcePath = tempDir.resolve(backupFile.getOriginalFilename() == null ? "backup" : backupFile.getOriginalFilename()).normalize();
        Files.copy(backupFile.getInputStream(), sourcePath, StandardCopyOption.REPLACE_EXISTING);

        if (originalName.endsWith(".sql")) {
            return new BackupArchiveContents(sourcePath, findDirectoryByName(tempDir, "uploads"), findDirectoryByName(tempDir, "auditlogs"));
        }

        if (!originalName.endsWith(".zip")) {
            throw new IllegalStateException("Formato de backup no soportado. Sube un .zip o un .sql.");
        }

        try (ZipInputStream zipInputStream = new ZipInputStream(Files.newInputStream(sourcePath))) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                Path resolved = tempDir.resolve(entry.getName()).normalize();
                if (!resolved.startsWith(tempDir)) {
                    throw new IllegalStateException("El archivo comprimido contiene rutas no permitidas.");
                }

                if (entry.isDirectory()) {
                    Files.createDirectories(resolved);
                } else {
                    Files.createDirectories(resolved.getParent());
                    Files.copy(zipInputStream, resolved, StandardCopyOption.REPLACE_EXISTING);
                }
                zipInputStream.closeEntry();
            }
        }

        Path sqlFile = findSqlFile(tempDir);
        Path uploadsDir = findDirectoryByName(tempDir, "uploads");
        Path auditLogsDir = findDirectoryByName(tempDir, "auditlogs");
        return new BackupArchiveContents(sqlFile, uploadsDir, auditLogsDir);
    }

    private Path findSqlFile(Path root) throws IOException {
        try (var paths = Files.walk(root)) {
            return paths
                    .filter(path -> Files.isRegularFile(path))
                    .filter(path -> {
                        String name = path.getFileName().toString().toLowerCase();
                        return name.equals("postgredatabase.sql")
                                || name.equals("databasecopy.sql")
                                || name.endsWith(".sql");
                    })
                    .findFirst()
                    .orElse(null);
        }
    }

    private Path findDirectoryByName(Path root, String expectedName) throws IOException {
        try (var paths = Files.walk(root)) {
            return paths
                    .filter(path -> Files.isDirectory(path))
                    .filter(path -> path.getFileName() != null && path.getFileName().toString().equalsIgnoreCase(expectedName))
                    .findFirst()
                    .orElse(null);
        }
    }

    private DatabaseConnectionInfo parseDatasourceUrl() {
        Matcher matcher = JDBC_POSTGRES_PATTERN.matcher(datasourceUrl);
        if (!matcher.matches()) {
            throw new IllegalStateException("No se pudo interpretar la URL JDBC de PostgreSQL.");
        }

        String database = URI.create("postgresql://localhost/" + matcher.group(3)).getPath().replaceFirst("^/", "");
        return new DatabaseConnectionInfo(
                matcher.group(1),
                matcher.group(2) == null ? "5432" : matcher.group(2),
                database
        );
    }

    private BackupSettings getOrCreateEntity() {
        return backupSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> {
                    BackupSettings settings = new BackupSettings();
                    settings.setId(SETTINGS_ID);
                    return backupSettingsRepository.save(settings);
                });
    }

    private BackupSettingsResponse toSettingsResponse(BackupSettings settings) {
        return new BackupSettingsResponse(
                settings.getScheduleDay(),
                settings.getScheduleHour(),
                settings.getLastRunDate(),
                settings.getLastBackupPath()
        );
    }

    private record DatabaseConnectionInfo(String host, String port, String database) {
    }

    private record BackupArchiveContents(Path sqlFile, Path uploadsDir, Path auditLogsDir) {
    }
}
