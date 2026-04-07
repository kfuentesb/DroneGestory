package com.dronetools.dronegestory.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/files")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class FileBrowserController {

    @GetMapping("/list")
    public List<FileBrowserItem> list(
            @RequestParam(value = "path", required = false) String rawPath
    ) {
        Path uploadsRoot = uploadsRoot();
        if (!Files.exists(uploadsRoot) || !Files.isDirectory(uploadsRoot)) {
            return List.of();
        }

        List<FileBrowserItem> items = new ArrayList<>();
        try (Stream<Path> stream = Files.walk(uploadsRoot)) {
            stream.filter(path -> !path.equals(uploadsRoot))
                    .sorted((a, b) -> {
                        int depthA = uploadsRoot.relativize(a).getNameCount();
                        int depthB = uploadsRoot.relativize(b).getNameCount();
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
                    .forEach(path -> items.add(toItem(uploadsRoot, path)));
        } catch (IOException ex) {
            throw new RuntimeException("Error listing files", ex);
        }
        return items;
    }

    @GetMapping("/content")
    public ResponseEntity<Resource> content(@RequestParam("path") String rawPath) {
        Path target = resolveInsideUploads(rawPath);
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

    private FileBrowserItem toItem(Path uploadsRoot, Path path) {
        String relativePath = uploadsRoot.relativize(path).toString().replace("\\", "/");
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

    private Path resolveInsideUploads(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new IllegalArgumentException("path is required");
        }

        String decoded = URLDecoder.decode(rawPath, StandardCharsets.UTF_8);
        String normalized = decoded.startsWith("/") ? decoded.substring(1) : decoded;

        Path uploadsRoot = uploadsRoot();
        Path target = uploadsRoot.resolve(normalized).normalize();
        if (!target.startsWith(uploadsRoot)) {
            throw new IllegalArgumentException("Invalid path");
        }
        return target;
    }

    private Path uploadsRoot() {
        return Paths.get("uploads").toAbsolutePath().normalize();
    }

    public record FileBrowserItem(String id, String type, Long size, Boolean lazy) {
    }
}
