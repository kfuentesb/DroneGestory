package com.dronetools.dronegestory.controller.anexos;

import jakarta.servlet.http.HttpServletRequest;
import com.dronetools.dronegestory.service.OperationAccessService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves stored Anexo4 images.
 * Endpoint: GET /api/operations/anexo4/images/operations/{operationId}/anexo4/{filename}
 * Maps to file: uploads/operations/{operationId}/anexo4/{filename}
 *
 * The literal path segment "anexo4" takes precedence over the {operationId} path variable
 * in Anexo4Controller, so Spring MVC routes image requests here correctly.
 */
@RestController
@RequestMapping("/api/operations/anexo4")
public class OperationAnexo4ImageController {

    private static final String IMAGE_URL_MARKER = "/api/operations/anexo4/images/";
    private final OperationAccessService operationAccessService;

    public OperationAnexo4ImageController(OperationAccessService operationAccessService) {
        this.operationAccessService = operationAccessService;
    }

    @GetMapping("/images/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getAnexo4Image(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        int markerIndex = requestUri.indexOf(IMAGE_URL_MARKER);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }

        String filename = requestUri.substring(markerIndex + IMAGE_URL_MARKER.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Restrict to only Anexo4 paths (operations/{id}/anexo4/{file})
        if (!filename.matches("operations/\\d+/anexo4/[^/]+")) {
            return ResponseEntity.badRequest().build();
        }

        String[] pathParts = filename.split("/");
        if (pathParts.length < 4) {
            return ResponseEntity.badRequest().build();
        }
        String operationId = pathParts[1];
        operationAccessService.assertCanAccess(Long.valueOf(operationId));

        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path file = uploadsDir.resolve(filename).normalize();

        // Prevent path traversal
        if (!file.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            //contentType = "application/octet-stream";
            contentType = "image/png";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    // PUT: upload or replace an image
    @PutMapping(value = "/images/**", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> putAnexo4Image(HttpServletRequest request,
                                               @RequestParam("file") MultipartFile filePart) throws IOException {
        String requestUri = request.getRequestURI();
        int markerIndex = requestUri.indexOf(IMAGE_URL_MARKER);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }
        String filename = requestUri.substring(markerIndex + IMAGE_URL_MARKER.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (!filename.matches("operations/\\d+/anexo4/[^/]+")) {
            return ResponseEntity.badRequest().build();
        }
        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path filePath = uploadsDir.resolve(filename).normalize();

        // Prevent path traversal
        if (!filePath.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }
        // Create parent directories if they don't exist
        Files.createDirectories(filePath.getParent());

        // Save (replace) the file
        filePart.transferTo(filePath);

        return ResponseEntity.ok().build();
    }

    // DELETE: remove an image
    @DeleteMapping("/images/**")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteAnexo4Image(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        int markerIndex = requestUri.indexOf(IMAGE_URL_MARKER);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }
        String filename = requestUri.substring(markerIndex + IMAGE_URL_MARKER.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (!filename.matches("operations/\\d+/anexo4/[^/]+")) {
            return ResponseEntity.badRequest().build();
        }
        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path filePath = uploadsDir.resolve(filename).normalize();

        // Prevent path traversal
        if (!filePath.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }
        // Delete file if exists
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
