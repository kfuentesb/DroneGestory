package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.FlightTimeDocumentationDTO;
import com.dronetools.dronegestory.service.FlightTimeDocumentationService;
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

@RestController
@RequestMapping("/api/flight-time-documentation")
@RequiredArgsConstructor
public class FlightTimeDocumentationController {

    private final FlightTimeDocumentationService flightTimeDocumentationService;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FlightTimeDocumentationDTO> getById(@PathVariable Long id) {
        return flightTimeDocumentationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/flight-time/{flightTimeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FlightTimeDocumentationDTO> getByFlightTimeId(@PathVariable Long flightTimeId) {
        return flightTimeDocumentationService.findByFlightTimeId(flightTimeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/flight-time/{flightTimeId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FlightTimeDocumentationDTO> createOrReplace(
            @PathVariable Long flightTimeId,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                flightTimeDocumentationService.createOrReplaceWithFile(
                        flightTimeId,
                        resolveDocumentationType(documentationType, documentationLabel),
                        expireDate,
                        dateIndefinite,
                        file
                )
        );
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FlightTimeDocumentationDTO> update(
            @PathVariable Long id,
            @RequestParam(value = "documentationType", required = false) String documentationType,
            @RequestParam(value = "documentationLabel", required = false) String documentationLabel,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return flightTimeDocumentationService.updateWithFile(
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
        flightTimeDocumentationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/flight-time-documentation/files/";
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
