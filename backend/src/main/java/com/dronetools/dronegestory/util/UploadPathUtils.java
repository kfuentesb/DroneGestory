package com.dronetools.dronegestory.util;

import java.io.IOException;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class UploadPathUtils {

    private UploadPathUtils() {
    }

    public static String safeSegment(String value) {
        return (value == null || value.isBlank())
                ? "unknown"
                : value.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    public static String aircraftDocumentationPath(Long aircraftId, String documentationType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("aircraft", aircraftId.toString(), "documentation", safeSegment(documentationType))
        );
    }

    public static String aircraftModelDocumentationPath(Long modelId, String documentationType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("aircraft-model", modelId.toString(), "documentation", safeSegment(documentationType))
        );
    }

    public static String userCertificatePath(Integer userId, String certificateType, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("users", userId.toString(), "certificates", safeSegment(certificateType))
        );
    }

    public static String userProfilePath(Integer userId, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("users", userId.toString(), "profile")
        );
    }

    public static String operationDocumentationPath(Long documentationId, Integer versionNumber, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("operation-documentation", documentationId.toString(), "v" + versionNumber)
        );
    }

    public static String operationAnexo4Path(Long operationId, String storedValue) {
        return resolveRelativePath(
                storedValue,
                Paths.get("operations", operationId.toString(), "anexo4")
        );
    }

    public static void deleteFileAndPruneEmptyParents(String relativePath) throws IOException {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        Path uploadsDir = uploadsRoot();
        Path file = uploadsDir.resolve(relativePath).normalize();
        if (!file.startsWith(uploadsDir)) {
            return;
        }

        Files.deleteIfExists(file);
        pruneEmptyParents(file.getParent(), uploadsDir);
    }

    public static Path uploadsRoot() {
        return Paths.get("uploads").toAbsolutePath().normalize();
    }

    private static String resolveRelativePath(String storedValue, Path parentPath) {
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }

        String normalized = storedValue.replace("\\", "/");
        if (normalized.contains("/")) {
            return normalized;
        }

        return parentPath.resolve(normalized).toString().replace("\\", "/");
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
