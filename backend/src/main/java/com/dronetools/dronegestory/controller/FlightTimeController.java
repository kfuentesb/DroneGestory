package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.FlightTimeDTO;
import com.dronetools.dronegestory.dto.FlightTimeRequestDTO;
import com.dronetools.dronegestory.service.FlightTimeService;
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
@RequestMapping("/api/flight-hours")
@RequiredArgsConstructor
public class FlightTimeController {

    private final FlightTimeService flightTimeService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<FlightTimeDTO> getAll() {
        return flightTimeService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FlightTimeDTO> getById(@PathVariable Long id) {
        return flightTimeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/aircraft/{aircraftId}")
    @PreAuthorize("isAuthenticated()")
    public List<FlightTimeDTO> getByAircraftId(@PathVariable Long aircraftId) {
        return flightTimeService.findByAircraftId(aircraftId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FlightTimeDTO> create(@RequestBody FlightTimeRequestDTO request) {
        return ResponseEntity.ok(flightTimeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FlightTimeDTO> update(@PathVariable Long id, @RequestBody FlightTimeRequestDTO request) {
        return flightTimeService.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        flightTimeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
