package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.AircraftModelDocumentationDTO;
import com.dronetools.dronegestory.service.AircraftModelDocumentationService;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/aircraft-model-documentation")
@RequiredArgsConstructor
public class AircraftModelDocumentationController {

    private final AircraftModelDocumentationService aircraftModelDocumentationService;

    @GetMapping("/model/{modelId}")
    @PreAuthorize("isAuthenticated()")
    public List<AircraftModelDocumentationDTO> getByModelId(@PathVariable Long modelId) {
        return aircraftModelDocumentationService.findDtoByModelId(modelId);
    }

    @PostMapping(value = "/model/{modelId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftModelDocumentationDTO> createWithFile(
            @PathVariable Long modelId,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return aircraftModelDocumentationService.createWithFile(
                        modelId,
                        resolveDocumentationType(documentationType, documentationLabel),
                        expireDate,
                        dateIndefinite,
                        file
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AircraftModelDocumentationDTO> updateWithFile(
            @PathVariable Long id,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return aircraftModelDocumentationService.updateWithFile(
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
        aircraftModelDocumentationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String resolveDocumentationType(String documentationType, String documentationLabel) {
        if (documentationType != null && !documentationType.isBlank()) {
            return documentationType.trim();
        }
        if (documentationLabel != null && !documentationLabel.isBlank()) {
            return documentationLabel.trim();
        }
        return null;
    }
}
