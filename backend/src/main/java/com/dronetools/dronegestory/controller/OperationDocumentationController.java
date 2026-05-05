package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.OperationDocumentationDTO;
import com.dronetools.dronegestory.service.OperationDocumentationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/operation-documentation")
@RequiredArgsConstructor
public class OperationDocumentationController {

    private final OperationDocumentationService operationDocumentationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<OperationDocumentationDTO> getAll(Authentication authentication) {
        return operationDocumentationService.findAll(canManage(authentication));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OperationDocumentationDTO> getById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return operationDocumentationService.findById(id, canManage(authentication))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OperationDocumentationDTO> create(
            @RequestParam("name") String name,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "vNum", defaultValue = "1") Integer vNum,
            @RequestParam(value = "rNum", defaultValue = "0") Integer rNum
    ) {
        return ResponseEntity.ok(operationDocumentationService.create(name, notes, file, vNum, rNum));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OperationDocumentationDTO> update(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "vNum", required = false) Integer vNum,
            @RequestParam(value = "rNum", required = false) Integer rNum
    ) {
        return ResponseEntity.ok(operationDocumentationService.update(id, name, notes, vNum, rNum, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        operationDocumentationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/operation-documentation/files/";
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

    @DeleteMapping("/{documentationId}/version/{versionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OperationDocumentationDTO> deleteVersion(
            @PathVariable("documentationId") Long documentationId, 
            @PathVariable("versionId") Long versionId) {
        return ResponseEntity.ok(operationDocumentationService.deleteVersion(documentationId, versionId));
    }

    private boolean canManage(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()) ||
                        "ROLE_MANAGER".equals(authority.getAuthority())
                );
    }
}
