package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.AircraftRequestDTO;
import com.dronetools.dronegestory.dto.response.AircraftResponseDTO;
import com.dronetools.dronegestory.service.AircraftDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftDtoService aircraftDtoService;

    @GetMapping
    public List<AircraftResponseDTO> getAll() {
        return aircraftDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AircraftResponseDTO> getById(@PathVariable Integer id) {
        return aircraftDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AircraftResponseDTO> create(@RequestBody AircraftRequestDTO dto) {
        return ResponseEntity.ok(aircraftDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AircraftResponseDTO> update(@PathVariable Integer id, @RequestBody AircraftRequestDTO dto) {
        return aircraftDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        aircraftDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}