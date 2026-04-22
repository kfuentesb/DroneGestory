package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.MaintenanceDocumentationDTO;
import com.dronetools.dronegestory.dto.MaintenanceDocumentationMetadataDTO;
import com.dronetools.dronegestory.service.MaintenanceDocumentationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/maintenance-documentation")
@RequiredArgsConstructor
public class MaintenanceDocumentationController {

    private final MaintenanceDocumentationService maintenanceDocumentationService;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaintenanceDocumentationDTO> getById(@PathVariable Long id) {
        return maintenanceDocumentationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/maintenance/{maintenanceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaintenanceDocumentationDTO> getByMaintenanceId(@PathVariable Long maintenanceId) {
        return maintenanceDocumentationService.findByMaintenanceId(maintenanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/maintenance/{maintenanceId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDocumentationDTO> createOrReplace(
            @PathVariable Long maintenanceId,
            @RequestPart(value = "metadata", required = false) MaintenanceDocumentationMetadataDTO metadata,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                maintenanceDocumentationService.createOrReplaceWithFile(
                        maintenanceId,
                        resolveDocumentationType(metadata, documentationType, documentationLabel),
                        resolveExpireDate(metadata, expireDate),
                        resolveDateIndefinite(metadata, dateIndefinite),
                        file
                )
        );
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDocumentationDTO> update(
            @PathVariable Long id,
            @RequestPart(value = "metadata", required = false) MaintenanceDocumentationMetadataDTO metadata,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return maintenanceDocumentationService.updateWithFile(
                        id,
                        resolveDocumentationType(metadata, documentationType, documentationLabel),
                        resolveExpireDate(metadata, expireDate),
                        resolveDateIndefinite(metadata, dateIndefinite),
                        file
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceDocumentationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/maintenance/{maintenanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteByMaintenanceId(@PathVariable Long maintenanceId) {
        maintenanceDocumentationService.deleteByMaintenanceId(maintenanceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/maintenance-documentation/files/";
        int markerIndex = requestUri.indexOf(marker);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }

        String filename = requestUri.substring(markerIndex + marker.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path file = uploadsDir.resolve(filename).normalize();
        if (!file.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    private String resolveDocumentationType(
            MaintenanceDocumentationMetadataDTO metadata,
            String documentationType,
            String documentationLabel
    ) {
        if (metadata != null) {
            if (metadata.documentationType() != null && !metadata.documentationType().isBlank()) {
                return metadata.documentationType().trim();
            }
            if (metadata.documentationLabel() != null && !metadata.documentationLabel().isBlank()) {
                return metadata.documentationLabel().trim();
            }
        }
        if (documentationType != null && !documentationType.isBlank()) {
            return documentationType.trim();
        }
        if (documentationLabel != null && !documentationLabel.isBlank()) {
            return documentationLabel.trim();
        }
        throw new IllegalArgumentException("Either documentationType or documentationLabel is required.");
    }

    private String resolveExpireDate(MaintenanceDocumentationMetadataDTO metadata, String expireDate) {
        if (metadata != null && metadata.expireDate() != null) {
            return metadata.expireDate().toString();
        }
        return expireDate;
    }

    private Boolean resolveDateIndefinite(MaintenanceDocumentationMetadataDTO metadata, Boolean dateIndefinite) {
        if (metadata != null && metadata.dateIndefinite() != null) {
            return metadata.dateIndefinite();
        }
        return dateIndefinite;
    }
}
