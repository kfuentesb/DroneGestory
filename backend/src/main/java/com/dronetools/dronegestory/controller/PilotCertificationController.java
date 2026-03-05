package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;
import com.dronetools.dronegestory.service.PilotCertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilot-certifications")
@RequiredArgsConstructor
public class PilotCertificationController {

    private final PilotCertificationService pilotCertificationService;

    @GetMapping
    public List<PilotCertification> getAll() {
        return pilotCertificationService.findAll();
    }

    @GetMapping("/{pilotId}/{certificationId}")
    public ResponseEntity<PilotCertification> getById(
            @PathVariable Integer pilotId,
            @PathVariable Integer certificationId
    ) {
        PilotCertificationId id = new PilotCertificationId(pilotId, certificationId);
        return pilotCertificationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PilotCertification create(@RequestBody PilotCertification pilotCertification) {
        return pilotCertificationService.save(pilotCertification);
    }

    @DeleteMapping("/{pilotId}/{certificationId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer pilotId,
            @PathVariable Integer certificationId
    ) {
        PilotCertificationId id = new PilotCertificationId(pilotId, certificationId);
        pilotCertificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}