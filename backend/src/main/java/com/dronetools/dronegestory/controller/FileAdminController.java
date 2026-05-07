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
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body("Path is required");
        }

        try {
            fileActionService.deleteFileAndSyncDb(path);
            return ResponseEntity.ok(Map.of("ok", true, "message", "File and DB synced"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping(value = "/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> replaceFile(
            @RequestParam("path") String path,
            @RequestParam("file") MultipartFile file
    ) {
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Path is required"));
        }

        try {
            String newPath = fileActionService.replaceFileAndSyncDb(path, file);
            return ResponseEntity.ok(Map.of("ok", true, "path", "/" + newPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}
