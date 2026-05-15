package com.dronetools.dronegestory.util;

import java.io.IOException;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class UploadPathUtils {
    public static final String DATABASE_RELATED_DIR = "database-relationed";

    private static final String[] DATABASE_MANAGED_TOP_LEVEL_DIRS = {
            "aircraft",
            "aircraft-model",
            "operations",
            "users",
            "operation-documentation"
    };

    private UploadPathUtils() {
    }

    public static String safeSegment(String value) {
        return (value == null || value.isBlank())
                ? "unknown"
                : value.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    public static String entityFolder(Number id, String label) {
        String safeLabel = safeSegment(label);
        if (id == null) {
            return safeLabel;
        }
        return id + "-" + safeLabel;
    }

    public static String aircraftModelFolder(String manufacturer, String model) {
        return safeSegment(firstNonBlank(model, "model") + "-" + firstNonBlank(manufacturer, "manufacturer"));
    }

    public static String legacyAircraftModelFolder(String manufacturer, String model) {
        return safeSegment(firstNonBlank(manufacturer, "manufacturer") + "-" + firstNonBlank(model, "model"));
    }

    public static String aircraftFolder(String serialNumber, String model) {
        return safeSegment(firstNonBlank(serialNumber, "nserie") + "-" + firstNonBlank(model, "model"));
    }

    public static String operationFolder(String codigo) {
        return safeSegment(codigo);
    }

    public static String aircraftDocumentationPath(Long aircraftId, String documentationType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                databaseRelativePath("aircraft", aircraftId.toString(), "documentation", safeSegment(documentationType))
        );
    }

    public static String aircraftModelDocumentationPath(Long modelId, String documentationType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                databaseRelativePath("aircraft-model", modelId.toString(), "documentation", safeSegment(documentationType))
        );
    }

    public static String userCertificatePath(Integer userId, String certificateType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                databaseRelativePath("users", userId.toString(), "certificates", safeSegment(certificateType))
        );
    }

    public static String userProfilePath(Integer userId, String storedValue) {
        return resolveRelativePath(
                storedValue,
                databaseRelativePath("users", userId.toString(), "profile")
        );
    }

    public static String operationDocumentationPath(Long documentationId, String documentationName, Integer versionNumber, String storedValue) {
        String idNameFolder = entityFolder(documentationId, documentationName);

        return resolveRelativePath(
                storedValue,
                databaseRelativePath("operation-documentation", idNameFolder, "v" + versionNumber)
        );
    }

    public static String operationAnexo4Path(Long operationId, String storedValue) {
        return resolveRelativePath(
                storedValue,
                databaseRelativePath("operations", operationId.toString(), "anexo4")
        );
    }

    public static Path databaseManagedRoot() {
        return uploadsRoot().resolve(DATABASE_RELATED_DIR).normalize();
    }

    public static Path databaseRelativePath(String first, String... more) {
        return Paths.get(DATABASE_RELATED_DIR).resolve(Paths.get(first, more));
    }

    public static String databaseRelativePathString(String first, String... more) {
        return databaseRelativePath(first, more).toString().replace("\\", "/");
    }

    public static String toDatabaseRelativePath(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return relativePath;
        }
        String normalized = cleanRelativePath(relativePath);
        if (normalized.equals(DATABASE_RELATED_DIR) || normalized.startsWith(DATABASE_RELATED_DIR + "/")) {
            return normalized;
        }
        for (String topLevelDir : DATABASE_MANAGED_TOP_LEVEL_DIRS) {
            if (normalized.equals(topLevelDir) || normalized.startsWith(topLevelDir + "/")) {
                return DATABASE_RELATED_DIR + "/" + normalized;
            }
        }
        return normalized;
    }

    public static boolean isDatabaseManagedPath(String relativePath) {
        String normalized = cleanRelativePath(relativePath);
        return normalized.equals(DATABASE_RELATED_DIR) || normalized.startsWith(DATABASE_RELATED_DIR + "/");
    }

    public static String cleanRelativePath(String path) {
        if (path == null) {
            return "";
        }
        return path.replace("\\", "/").replaceFirst("^/+", "");
    }

    public static void deleteFileAndPruneEmptyParents(String relativePath) throws IOException {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        Path uploadsDir = uploadsRoot();
        Path file = resolveExistingUploadPath(relativePath);
        if (!file.startsWith(uploadsDir)) {
            return;
        }

        Files.deleteIfExists(file);
        pruneEmptyParents(file.getParent(), uploadsDir);
    }

    private static String customUploadsRootPath = null;

    public static void setCustomUploadsRootPath(String path) {
        customUploadsRootPath = path;
    }

    public static Path uploadsRoot() {
        if (customUploadsRootPath != null && !customUploadsRootPath.isBlank()) {
            return Paths.get(customUploadsRootPath).toAbsolutePath().normalize();
        }
        return Paths.get("uploads").toAbsolutePath().normalize();
    }

    private static String resolveRelativePath(String storedValue, Path parentPath) {
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }

        String normalized = storedValue.replace("\\", "/");
        if (normalized.contains("/")) {
            return toDatabaseRelativePath(normalized);
        }

        return parentPath.resolve(normalized).toString().replace("\\", "/");
    }

    public static Path resolveExistingUploadPath(String relativePath) {
        Path uploadsDir = uploadsRoot();
        String normalized = cleanRelativePath(relativePath);
        String databaseRelativePath = toDatabaseRelativePath(normalized);
        Path databasePath = uploadsDir.resolve(databaseRelativePath).normalize();
        if (Files.exists(databasePath)) {
            return databasePath;
        }

        Path legacyPath = uploadsDir.resolve(normalized).normalize();
        if (Files.exists(legacyPath)) {
            return legacyPath;
        }

        return databasePath;
    }

    private static String firstNonBlank(String primary, String fallback) {
        return primary == null || primary.isBlank() ? fallback : primary;
    }

    private static void pruneEmptyParents(Path start, Path uploadsDir) throws IOException {
        Path current = start;
        while (current != null && !current.equals(uploadsDir) && current.startsWith(uploadsDir)) {
            try {
                Files.deleteIfExists(current);
            } catch (DirectoryNotEmptyException ex) {
                return;
            }
            current = current.getParent();
        }
    }
}
