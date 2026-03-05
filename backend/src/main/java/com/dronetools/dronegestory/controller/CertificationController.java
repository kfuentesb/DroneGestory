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

    private final CertificationService service;

    @GetMapping
    public List<Certification> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certification> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Certification create(@RequestBody Certification certification) {
        return service.save(certification);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Certification> update(@PathVariable Integer id, @RequestBody Certification certification) {
        return service.findById(id)
                .map(existing -> {
                    certification.setId(existing.getId());
                    return ResponseEntity.ok(service.save(certification));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}