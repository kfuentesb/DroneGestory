package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.service.FileActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/files")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@RequiredArgsConstructor
public class FileAdminController {

    private final FileActionService fileActionService;

    @PostMapping("/remove")
    public ResponseEntity<?> removeFile(@RequestBody Map<String, String> payload) {
        String path = payload.get("path");
        String type = payload.getOrDefault("type", "uploads");
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body("Path is required");
        }

        try {
            fileActionService.deleteFileAndSyncDb(path, type);
            return ResponseEntity.ok(Map.of("ok", true, "message", "File and DB synced"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping(value = "/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> replaceFile(
            @RequestParam("path") String path,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "uploads") String type
    ) {
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Path is required"));
        }

        try {
            String newPath = fileActionService.replaceFileAndSyncDb(path, file, type);
            return ResponseEntity.ok(Map.of("ok", true, "path", "/" + newPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/folder")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, String> payload) {
        String parent = payload.getOrDefault("parent", "/");
        String name = payload.get("name");
        String type = payload.getOrDefault("type", "uploads");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Folder name is required"));
        }

        try {
            String newPath = fileActionService.createFolder(parent, name, type);
            return ResponseEntity.ok(Map.of("ok", true, "path", "/" + newPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestParam(value = "parent", required = false) String parent,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "uploads") String type
    ) {
        try {
            String newPath = fileActionService.uploadManualFile(parent, file, type);
            return ResponseEntity.ok(Map.of("ok", true, "path", "/" + newPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/rename")
    public ResponseEntity<?> rename(@RequestBody Map<String, String> payload) {
        String path = payload.get("path");
        String name = payload.get("name");
        String type = payload.getOrDefault("type", "uploads");
        if (path == null || path.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Path and name are required"));
        }

        try {
            String newPath = fileActionService.renameManualPath(path, name, type);
            return ResponseEntity.ok(Map.of("ok", true, "path", "/" + newPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}
