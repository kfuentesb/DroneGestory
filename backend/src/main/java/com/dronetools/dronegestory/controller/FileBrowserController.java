package com.dronetools.dronegestory.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.dronetools.dronegestory.util.UploadPathUtils;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/files")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class FileBrowserController {

    @Value("${APP_UPLOADS_ROOT:uploads}")
    private String uploadsRootPath;

    @Value("${APP_BACKUPS_ROOT:backups}")
    private String backupsRootPath;

    private Path getRootPath(String type) {
        if ("backups".equalsIgnoreCase(type)) {
            return Paths.get(backupsRootPath).toAbsolutePath().normalize();
        }
        return Paths.get(uploadsRootPath).toAbsolutePath().normalize();
    }

    @GetMapping("/list")
    public List<FileBrowserItem> list(
            @RequestParam(value = "path", required = false) String rawPath,
            @RequestParam(value = "type", defaultValue = "uploads") String type) {
        Path root = getRootPath(type);
        if (!Files.exists(root) || !Files.isDirectory(root)) {
            try {
                Files.createDirectories(root);
            } catch (IOException ex) {
                throw new RuntimeException("Error creating root folder", ex);
            }
        }
        if ("uploads".equalsIgnoreCase(type)) {
            ensureDatabaseRelatedFolders();
        }

        List<FileBrowserItem> items = new ArrayList<>();
        try (Stream<Path> stream = Files.walk(root)) {
            stream.filter(path -> !path.equals(root))
                    .sorted((a, b) -> {
                        int depthA = root.relativize(a).getNameCount();
                        int depthB = root.relativize(b).getNameCount();
                        if (depthA != depthB) {
                            return Integer.compare(depthA, depthB);
                        }
                        boolean dirA = Files.isDirectory(a);
                        boolean dirB = Files.isDirectory(b);
                        if (dirA != dirB) {
                            return dirA ? -1 : 1;
                        }
                        return a.getFileName().toString().compareToIgnoreCase(b.getFileName().toString());
                    })
                    .forEach(path -> items.add(toItem(root, path)));
        } catch (IOException ex) {
            throw new RuntimeException("Error listing files", ex);
        }
        return items;
    }

    @GetMapping("/content")
    public ResponseEntity<Resource> content(
            @RequestParam("path") String rawPath,
            @RequestParam(value = "type", defaultValue = "uploads") String type) {
        Path target = resolveInsideRoot(rawPath, type);
        if (!Files.exists(target) || Files.isDirectory(target)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(target);
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException ex) {
            throw new RuntimeException("Error reading file", ex);
        }
    }

    private FileBrowserItem toItem(Path root, Path path) {
        String relativePath = root.relativize(path).toString().replace("\\", "/");
        String id = "/" + relativePath;
        boolean folder = Files.isDirectory(path);
        Long size = null;
        if (!folder) {
            try {
                size = Files.size(path);
            } catch (IOException ignored) {
                size = null;
            }
        }
        return new FileBrowserItem(id, folder ? "folder" : "file", size, null);
    }

    private Path resolveInsideRoot(String rawPath, String type) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new IllegalArgumentException("path is required");
        }

        String decoded = URLDecoder.decode(rawPath, StandardCharsets.UTF_8);
        String normalized = decoded.startsWith("/") ? decoded.substring(1) : decoded;

        Path root = getRootPath(type);
        Path target = root.resolve(normalized).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Invalid path");
        }
        return target;
    }

    private void ensureDatabaseRelatedFolders() {
        try {
            Files.createDirectories(UploadPathUtils.databaseManagedRoot().resolve("aircraft"));
            Files.createDirectories(UploadPathUtils.databaseManagedRoot().resolve("aircraft-model"));
            Files.createDirectories(UploadPathUtils.databaseManagedRoot().resolve("operations"));
            Files.createDirectories(UploadPathUtils.databaseManagedRoot().resolve("users"));
            Files.createDirectories(UploadPathUtils.databaseManagedRoot().resolve("operation-documentation"));
        } catch (IOException ex) {
            throw new RuntimeException("Error creating database-related folders", ex);
        }
    }

    public record FileBrowserItem(String id, String type, Long size, Boolean lazy) {
    }
}