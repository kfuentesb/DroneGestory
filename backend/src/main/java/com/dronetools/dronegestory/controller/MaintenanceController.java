package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.MaintenanceDTO;
import com.dronetools.dronegestory.dto.MaintenanceRequestDTO;
import com.dronetools.dronegestory.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceDTO> getAll() {
        return maintenanceService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaintenanceDTO> getById(@PathVariable Long id) {
        return maintenanceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/aircraft/{aircraftId}")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceDTO> getByAircraftId(@PathVariable Long aircraftId) {
        return maintenanceService.findByAircraftId(aircraftId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> create(@RequestBody MaintenanceRequestDTO request) {
        return ResponseEntity.ok(maintenanceService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> update(@PathVariable Long id, @RequestBody MaintenanceRequestDTO request) {
        return maintenanceService.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
