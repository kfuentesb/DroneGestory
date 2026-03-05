package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.PilotRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotResponseDTO;
import com.dronetools.dronegestory.service.PilotDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilots")
@RequiredArgsConstructor
public class PilotController {

    private final PilotDtoService pilotDtoService;

    @GetMapping
    public List<PilotResponseDTO> getAll() {
        return pilotDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PilotResponseDTO> getById(@PathVariable Integer id) {
        return pilotDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PilotResponseDTO> create(@RequestBody PilotRequestDTO dto) {
        return ResponseEntity.ok(pilotDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PilotResponseDTO> update(@PathVariable Integer id, @RequestBody PilotRequestDTO dto) {
        return pilotDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pilotDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}