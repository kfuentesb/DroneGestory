package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.CertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.CertificationResponseDTO;
import com.dronetools.dronegestory.service.CertificationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationDtoService certificationDtoService;

    @GetMapping
    public List<CertificationResponseDTO> getAll() {
        return certificationDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificationResponseDTO> getById(@PathVariable Integer id) {
        return certificationDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CertificationResponseDTO> create(@RequestBody CertificationRequestDTO dto) {
        return ResponseEntity.ok(certificationDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationResponseDTO> update(@PathVariable Integer id, @RequestBody CertificationRequestDTO dto) {
        return certificationDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        certificationDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}