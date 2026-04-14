package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.AircraftDocumentationDTO;
import com.dronetools.dronegestory.service.AircraftDocumentationService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/aircraft-documentation")
@RequiredArgsConstructor
public class AircraftDocumentationController {

    private final AircraftDocumentationService aircraftDocumentationService;

    @GetMapping("/aircraft/{aircraftId}")
    @PreAuthorize("isAuthenticated()")
    public List<AircraftDocumentationDTO> getByAircraftId(@PathVariable Long aircraftId) {
        return aircraftDocumentationService.findByAircraftId(aircraftId);
    }

    @PostMapping(value = "/aircraft/{aircraftId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDocumentationDTO> createWithFile(
            @PathVariable Long aircraftId,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                aircraftDocumentationService.createWithFile(
                        aircraftId,
                        resolveDocumentationType(documentationType, documentationLabel),
                        expireDate,
                        dateIndefinite,
                        file
                )
        );
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDocumentationDTO> updateWithFile(
            @PathVariable Long id,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return aircraftDocumentationService.updateWithFile(
                        id,
                        resolveDocumentationType(documentationType, documentationLabel),
                        expireDate,
                        dateIndefinite,
                        file
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        aircraftDocumentationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore-default")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDocumentationDTO> restoreToDefault(@PathVariable Long id) {
        return aircraftDocumentationService.restoreToDefault(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/detach")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftDocumentationDTO> detachFromDefault(@PathVariable Long id) {
        return aircraftDocumentationService.detachFromDefault(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private String resolveDocumentationType(String documentationType, String documentationLabel) {
        if (documentationType != null && !documentationType.isBlank()) {
            return documentationType.trim();
        }
        if (documentationLabel != null && !documentationLabel.isBlank()) {
            return documentationLabel.trim();
        }
        throw new IllegalArgumentException("Either documentationType or documentationLabel is required.");
    }
}
