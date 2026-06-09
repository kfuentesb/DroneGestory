package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.ServerAttributesRequest;
import com.dronetools.dronegestory.dto.ServerAttributesResponse;
import com.dronetools.dronegestory.service.ServerSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/server-settings")
@RequiredArgsConstructor
public class ServerSettingsController {

    private final ServerSettingsService serverSettingsService;

    @GetMapping("/attributes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ServerAttributesResponse> getAttributes() {
        return ResponseEntity.ok(serverSettingsService.getAttributes());
    }

    @PutMapping("/attributes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ServerAttributesResponse> updateAttributes(@Valid @RequestBody ServerAttributesRequest request) {
        return ResponseEntity.ok(serverSettingsService.updateAttributes(request));
    }
}
