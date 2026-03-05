package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.PilotCertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotCertificationResponseDTO;
import com.dronetools.dronegestory.model.PilotCertificationId;
import com.dronetools.dronegestory.service.PilotCertificationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilot-certifications")
@RequiredArgsConstructor
public class PilotCertificationController {

    private final PilotCertificationDtoService pilotCertificationDtoService;

    @GetMapping
    public List<PilotCertificationResponseDTO> getAll() {
        return pilotCertificationDtoService.findAll();
    }

    @GetMapping("/{pilotId}/{certificationId}")
    public ResponseEntity<PilotCertificationResponseDTO> getById(
            @PathVariable Integer pilotId,
            @PathVariable Integer certificationId
    ) {
        PilotCertificationId id = new PilotCertificationId(pilotId, certificationId);
        return pilotCertificationDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PilotCertificationResponseDTO> create(@RequestBody PilotCertificationRequestDTO dto) {
        return ResponseEntity.ok(pilotCertificationDtoService.create(dto));
    }

    @DeleteMapping("/{pilotId}/{certificationId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer pilotId,
            @PathVariable Integer certificationId
    ) {
        PilotCertificationId id = new PilotCertificationId(pilotId, certificationId);
        pilotCertificationDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}