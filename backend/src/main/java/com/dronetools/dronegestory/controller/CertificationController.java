package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Certification;
import com.dronetools.dronegestory.service.CertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @GetMapping
    public List<Certification> getAll() {
        return certificationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certification> getById(@PathVariable Integer id) {
        return certificationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Certification create(@RequestBody Certification certification) {
        return certificationService.save(certification);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Certification> update(@PathVariable Integer id, @RequestBody Certification certification) {
        return certificationService.findById(id)
                .map(existing -> {
                    certification.setId(existing.getId());
                    return ResponseEntity.ok(certificationService.save(certification));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        certificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}