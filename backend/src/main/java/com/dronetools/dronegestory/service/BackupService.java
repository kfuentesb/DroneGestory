package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.BackupRunResponse;
import com.dronetools.dronegestory.dto.BackupRestoreResponse;
import com.dronetools.dronegestory.dto.BackupSettingsRequest;
import com.dronetools.dronegestory.dto.BackupSettingsResponse;
import com.dronetools.dronegestory.model.BackupSettings;
import com.dronetools.dronegestory.repository.BackupSettingsRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
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

    @Value("${APP_PG_DUMP_CMD:pg_dump}")
    private String pgDumpCommand;

    @Value("${APP_PSQL_CMD:psql}")
    private String psqlCommand;

    @Value("${APP_POSTGRES_DOCKER_CONTAINER:}")
    private String postgresDockerContainer;

    private static final String[] DEFAULT_POSTGRES_CONTAINER_NAMES = {"aeronaves_db", "dronegestory-db"};

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

    public DownloadableBackupPackage prepareDownloadableBackupPackage() {
        try {
            Path tempRoot = Files.createTempDirectory("backup-download-");
            Path backupDir = tempRoot.resolve("backup");
            Files.createDirectories(backupDir);
            createBackupBundle(backupDir);
            String fileName = "DroneGestory_backup_"
                    + LocalDateTime.now(MADRID_ZONE).format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
                    + ".zip";
            return new DownloadableBackupPackage(tempRoot, backupDir, fileName);
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("No se pudo preparar el backup para descarga: " + e.getMessage(), e);
        }
    }

    public BackupRestoreResponse restoreBackup(MultipartFile backupFile, boolean saveCurrentBeforeRestore) {
        System.out.println("[RESTORE] -> Iniciando proceso de restauración...");
        
        if (backupFile == null || backupFile.isEmpty()) {
            throw new IllegalStateException("Debes subir un archivo de backup valido.");
        }

            BackupRunResponse preRestoreBackup = null;
            if (saveCurrentBeforeRestore) {
                System.out.println("[RESTORE] -> Creando backup de seguridad previo...");
                preRestoreBackup = runBackup(getOrCreateEntity());
            }

        Path tempDir = null;
        try {
            System.out.println("[RESTORE] -> Creando directorio temporal...");
            tempDir = Files.createTempDirectory("backup-restore-");
            
            System.out.println("[RESTORE] -> Desempaquetando archivo ZIP: " + backupFile.getOriginalFilename());
            BackupArchiveContents archiveContents = unpackBackupFile(backupFile, tempDir);

            if (archiveContents.sqlFile() == null) {
                throw new IllegalStateException("El backup no contiene un archivo SQL de base de datos.");
            }

            System.out.println("[RESTORE] -> Reiniciando esquema de base de datos...");
            resetDatabaseSchema();
            
            System.out.println("[RESTORE] -> Ejecutando script SQL de restauración...");
            restoreDatabase(archiveContents.sqlFile());
            
            System.out.println("[RESTORE] -> Restaurando directorio de uploads...");
            boolean uploadsRestored = restoreDirectoryIfPresent(archiveContents.uploadsDir(), Path.of(uploadsRoot));
            
            System.out.println("[RESTORE] -> Restaurando logs de auditoría...");
            boolean auditLogsRestored = restoreDirectoryIfPresent(archiveContents.auditLogsDir(), Path.of(auditLogsRoot));

            System.out.println("[RESTORE] -> ¡Todo completado con éxito!");
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
            System.out.println("[RESTORE ERROR] -> Excepción catastrófica: " + e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("No se pudo restaurar el backup: " + e.getMessage(), e);
        } finally {
            if (tempDir != null) {
                System.out.println("[RESTORE] -> Limpiando directorio temporal...");
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
            BackupBundle bundle = createBackupBundle(backupDir);
            long backupSizeBytes = calculateDirectorySize(backupDir);

            settings.setLastRunDate(backupDate);
            settings.setLastBackupPath(backupDir.toString());
            backupSettingsRepository.save(settings);

            return new BackupRunResponse(
                    backupDate,
                    backupDir.toString(),
                    bundle.databaseFile().toString(),
                    backupSizeBytes,
                    bundle.uploadsCopied(),
                    bundle.auditLogsCopied()
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
        try {
            runPgDumpDatabase(databaseFile);
        } catch (IOException e) {
            if (isExecutableNotFound(e) && tryDockerFallback()) {
                runDockerPgDumpDatabase(databaseFile);
            } else {
                throw e;
            }
        }
    }

    private void runPgDumpDatabase(Path databaseFile) throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                pgDumpCommand,
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
            throw new IllegalStateException(pgDumpCommand + " fallo con codigo " + exitCode + ": " + output);
        }

        if (!Files.exists(databaseFile) || Files.size(databaseFile) == 0) {
            throw new IllegalStateException(pgDumpCommand + " no genero un archivo SQL valido.");
        }
    }

    private void runDockerPgDumpDatabase(Path databaseFile) throws IOException, InterruptedException {
        String container = resolvePostgresDockerContainer();
        if (container == null || container.isBlank()) {
            throw new IllegalStateException("No se encontró un contenedor Docker de PostgreSQL para ejecutar pg_dump.");
        }

        System.out.println("[BACKUP] -> Usa docker exec para generar el volcado de la base de datos en: " + container);
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "docker",
                "exec",
                "-i",
                container,
                pgDumpCommand,
                "-U", datasourceUsername,
                "-d", connectionInfo.database(),
                "-h", "localhost"
        );
        processBuilder.environment().put("PGPASSWORD", datasourcePassword);
        processBuilder.redirectErrorStream(false);

        Process process = processBuilder.start();
        var stderrCollector = new java.io.ByteArrayOutputStream();
        Thread stderrThread = new Thread(() -> {
            try {
                process.getErrorStream().transferTo(stderrCollector);
            } catch (IOException ignore) {
            }
        });
        stderrThread.start();

        try (var outputStream = Files.newOutputStream(databaseFile)) {
            process.getInputStream().transferTo(outputStream);
        }
        stderrThread.join();

        int exitCode = process.waitFor();
        String output = stderrCollector.toString();

        if (exitCode != 0) {
            throw new IllegalStateException("docker exec pg_dump fallo con codigo " + exitCode + ": " + output);
        }

        if (!Files.exists(databaseFile) || Files.size(databaseFile) == 0) {
            throw new IllegalStateException("docker exec pg_dump no genero un archivo SQL valido.");
        }
    }

    private void restoreDatabase(Path databaseFile) throws IOException, InterruptedException {
        try {
            runPsqlRestore(databaseFile);
        } catch (IOException e) {
            if (isExecutableNotFound(e) && tryDockerFallback()) {
                runDockerPsqlRestore(databaseFile);
            } else {
                throw e;
            }
        }
    }

    private void runPsqlRestore(Path databaseFile) throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                psqlCommand,
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
            throw new IllegalStateException(psqlCommand + " fallo con codigo " + exitCode + ": " + output);
        }
    }

    private void runDockerPsqlRestore(Path databaseFile) throws IOException, InterruptedException {
        String container = resolvePostgresDockerContainer();
        if (container == null || container.isBlank()) {
            throw new IllegalStateException("No se encontró un contenedor Docker de PostgreSQL para ejecutar psql.");
        }

        System.out.println("[RESTORE] -> Usa docker exec para restaurar la base de datos en: " + container);
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "docker",
                "exec",
                "-i",
                container,
                psqlCommand,
                "-U", datasourceUsername,
                "-d", connectionInfo.database(),
                "-v", "ON_ERROR_STOP=1"
        );
        processBuilder.environment().put("PGPASSWORD", datasourcePassword);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        try (var stdin = process.getOutputStream(); var fileStream = Files.newInputStream(databaseFile)) {
            fileStream.transferTo(stdin);
        }
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IllegalStateException("docker exec psql fallo con codigo " + exitCode + ": " + output);
        }
    }

    private void resetDatabaseSchema() throws IOException, InterruptedException {
        try {
            runPsqlResetSchema();
        } catch (IOException e) {
            if (isExecutableNotFound(e) && tryDockerFallback()) {
                runDockerPsqlResetSchema();
            } else {
                throw e;
            }
        }
    }

    private void runPsqlResetSchema() throws IOException, InterruptedException {
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                psqlCommand,
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

    private void runDockerPsqlResetSchema() throws IOException, InterruptedException {
        String container = resolvePostgresDockerContainer();
        if (container == null || container.isBlank()) {
            throw new IllegalStateException("No se encontró un contenedor Docker de PostgreSQL para ejecutar psql.");
        }

        System.out.println("[RESTORE] -> Usa docker exec para resetear el esquema en: " + container);
        DatabaseConnectionInfo connectionInfo = parseDatasourceUrl();
        ProcessBuilder processBuilder = new ProcessBuilder(
                "docker",
                "exec",
                "-i",
                container,
                psqlCommand,
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

    private boolean tryDockerFallback() {
        return resolvePostgresDockerContainer() != null;
    }

    private boolean isExecutableNotFound(IOException exception) {
        String message = exception.getMessage();
        if (message == null) {
            return false;
        }
        return message.contains("CreateProcess error=2")
                || message.contains("No such file or directory")
                || message.contains("cannot find the file")
                || message.contains("error=2");
    }

    private String resolvePostgresDockerContainer() {
        if (postgresDockerContainer != null && !postgresDockerContainer.isBlank()) {
            return postgresDockerContainer;
        }
        for (String candidate : DEFAULT_POSTGRES_CONTAINER_NAMES) {
            if (isDockerContainerAvailable(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private boolean isDockerContainerAvailable(String containerName) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("docker", "inspect", containerName);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean copyDirectoryIfExists(Path source, Path destination) throws IOException {
        Path normalizedSource = source.toAbsolutePath().normalize();
        if (!Files.isDirectory(normalizedSource)) {
            return false;
        }

        clearContentsOfDirectory(destination);
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

    private BackupBundle createBackupBundle(Path backupDir) throws IOException, InterruptedException {
        Path backendDir = backupDir.resolve("backend");
        Path databaseFile = backupDir.resolve("postgredatabase.sql");

        Files.createDirectories(backendDir);
        dumpDatabase(databaseFile);
        boolean uploadsCopied = copyDirectoryIfExists(Path.of(uploadsRoot), backendDir.resolve("uploads"));
        boolean auditLogsCopied = copyDirectoryIfExists(Path.of(auditLogsRoot), backendDir.resolve("AuditLogs"));

        return new BackupBundle(databaseFile, uploadsCopied, auditLogsCopied);
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

    public void writeBackupZip(Path backupDir, OutputStream outputStream) throws IOException {
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);
             var paths = Files.walk(backupDir)) {
            for (Path path : paths.sorted(Comparator.naturalOrder()).toList()) {
                if (Files.isDirectory(path)) {
                    continue;
                }

                String entryName = backupDir.relativize(path).toString().replace('\\', '/');
                zipOutputStream.putNextEntry(new ZipEntry(entryName));
                Files.copy(path, zipOutputStream);
                zipOutputStream.closeEntry();
            }
        }
    }

    // --- NUEVO MÉTODO SEGURO PARA VOLÚMENES DOCKER ---
    private void clearContentsOfDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }
        // Borramos todo lo de adentro, pero sin borrar la carpeta 'directory' en sí misma
        try (var paths = Files.walk(directory)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                if (!path.equals(directory)) {
                    Files.deleteIfExists(path);
                }
            }
        }
    }

    private boolean restoreDirectoryIfPresent(Path source, Path destination) throws IOException {
        if (source == null || !Files.isDirectory(source)) {
            System.out.println("[RESTORE] -> No se encontró directorio origen para: " + destination.getFileName());
            return false;
        }

        // Limpieza radical y nativa del contenido interno
        clearContentsNative(destination);

        // Asegurar que la estructura base existe
        Files.createDirectories(destination);

        // Copiar archivos uno a uno de forma limpia
        try (var paths = Files.walk(source)) {
            for (Path sourcePath : paths.toList()) {
                Path targetPath = destination.resolve(source.relativize(sourcePath).toString());
                if (Files.isDirectory(sourcePath)) {
                    Files.createDirectories(targetPath);
                } else {
                    // Usamos StandardCopyOption.REPLACE_EXISTING por seguridad extra
                    Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.COPY_ATTRIBUTES);
                }
            }
        }
        return true;
    }

    private void clearContentsNative(Path directory) {
        String absolutePath = directory.toAbsolutePath().normalize().toString();
        System.out.println("[RESTORE] -> Vaciando de forma nativa el contenido de: " + absolutePath);
        
        try {
            // Ejecuta "rm -rf /app/uploads/*" de forma segura usando el shell del contenedor
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "sh", "-c", "rm -rf " + absolutePath + "/* " + absolutePath + "/.[!.]*"
            );
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                System.out.println("[RESTORE WARNING] -> El comando de limpieza nativa retornó código " + exitCode + ": " + output);
            }
        } catch (Exception e) {
            System.out.println("[RESTORE WARNING] -> No se pudo realizar la limpieza nativa preventiva: " + e.getMessage());
        }
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
        Long lastBackupSizeBytes = null;
        if (settings.getLastBackupPath() != null) {
            try {
                Path lastBackupPath = Path.of(settings.getLastBackupPath());
                if (Files.exists(lastBackupPath)) {
                    lastBackupSizeBytes = calculateDirectorySize(lastBackupPath);
                }
            } catch (IOException ignored) {
            }
        }
        return new BackupSettingsResponse(
                settings.getScheduleDay(),
                settings.getScheduleHour(),
                settings.getLastRunDate(),
                settings.getLastBackupPath(),
                lastBackupSizeBytes
        );
    }

    private long calculateDirectorySize(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return 0L;
        }
        try (var paths = Files.walk(directory)) {
            return paths
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            return 0L;
                        }
                    })
                    .sum();
        }
    }

    private record DatabaseConnectionInfo(String host, String port, String database) {
    }

    private record BackupArchiveContents(Path sqlFile, Path uploadsDir, Path auditLogsDir) {
    }

    public record DownloadableBackupPackage(Path tempRoot, Path backupDir, String fileName) {
    }

    private record BackupBundle(Path databaseFile, boolean uploadsCopied, boolean auditLogsCopied) {
    }
}
