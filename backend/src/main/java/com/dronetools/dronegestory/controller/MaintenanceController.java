package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.MaintenanceDTO;
import com.dronetools.dronegestory.dto.MaintenanceDocumentationMetadataDTO;
import com.dronetools.dronegestory.dto.MaintenanceRequestDTO;
import com.dronetools.dronegestory.dto.MaintenanceUpsertMetadataDTO;
import com.dronetools.dronegestory.service.MaintenanceDocumentationService;
import com.dronetools.dronegestory.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final MaintenanceDocumentationService maintenanceDocumentationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTAINER')")
    public List<MaintenanceDTO> getAll() {
        return maintenanceService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTAINER')")
    public ResponseEntity<MaintenanceDTO> getById(@PathVariable Long id) {
        return maintenanceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/aircraft/{aircraftId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTAINER')")
    public List<MaintenanceDTO> getByAircraftId(@PathVariable Long aircraftId) {
        return maintenanceService.findByAircraftId(aircraftId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> create(@RequestBody MaintenanceRequestDTO request) {
        return ResponseEntity.ok(maintenanceService.create(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> createWithMetadata(
            @RequestPart("metadata") MaintenanceUpsertMetadataDTO metadata,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        MaintenanceDTO created = maintenanceService.create(toRequest(metadata));
        handleDocumentation(created.id(), metadata.documentation(), Boolean.TRUE.equals(metadata.removeDocumentation()), file);
        return maintenanceService.findById(created.id())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> update(@PathVariable Long id, @RequestBody MaintenanceRequestDTO request) {
        return maintenanceService.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> updateWithMetadata(
            @PathVariable Long id,
            @RequestPart("metadata") MaintenanceUpsertMetadataDTO metadata,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return maintenanceService.update(id, toRequest(metadata))
                .map(updated -> {
                    handleDocumentation(id, metadata.documentation(), Boolean.TRUE.equals(metadata.removeDocumentation()), file);
                    return maintenanceService.findById(id)
                            .map(ResponseEntity::ok)
                            .orElse(ResponseEntity.ok(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private MaintenanceRequestDTO toRequest(MaintenanceUpsertMetadataDTO metadata) {
        return new MaintenanceRequestDTO(
                metadata.aircraftId(),
                metadata.reviewType(),
                metadata.monthsRequired(),
                metadata.hoursFlightRequired(),
                metadata.maintenanceDate(),
                metadata.nextMaintenanceDate(),
                metadata.comments()
        );
    }

    private void handleDocumentation(
            Long maintenanceId,
            MaintenanceDocumentationMetadataDTO documentationMetadata,
            boolean removeDocumentation,
            MultipartFile file
    ) {
        if (removeDocumentation) {
            maintenanceDocumentationService.deleteByMaintenanceId(maintenanceId);
            return;
        }

        boolean hasFile = file != null && !file.isEmpty();
        if (!hasFile && documentationMetadata == null) {
            return;
        }

        String documentationType = resolveDocumentationType(documentationMetadata);
        String expireDate = documentationMetadata == null || documentationMetadata.expireDate() == null
                ? null
                : documentationMetadata.expireDate().toString();
        Boolean dateIndefinite = documentationMetadata == null ? null : documentationMetadata.dateIndefinite();

        maintenanceDocumentationService.createOrReplaceWithFile(
                maintenanceId,
                documentationType,
                expireDate,
                dateIndefinite,
                file
        );
    }

    private String resolveDocumentationType(MaintenanceDocumentationMetadataDTO documentationMetadata) {
        if (documentationMetadata == null) {
            throw new IllegalArgumentException("Documentation metadata is required when uploading maintenance documentation.");
        }
        if (documentationMetadata.documentationType() != null && !documentationMetadata.documentationType().isBlank()) {
            return documentationMetadata.documentationType().trim();
        }
        if (documentationMetadata.documentationLabel() != null && !documentationMetadata.documentationLabel().isBlank()) {
            return documentationMetadata.documentationLabel().trim();
        }
        throw new IllegalArgumentException("Documentation type or label is required.");
    }
}
