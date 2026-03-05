package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.InsuranceCompanyRequestDTO;
import com.dronetools.dronegestory.dto.response.InsuranceCompanyResponseDTO;
import com.dronetools.dronegestory.service.InsuranceCompanyDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance-companies")
@RequiredArgsConstructor
public class InsuranceCompanyController {

    private final InsuranceCompanyDtoService insuranceCompanyDtoService;

    @GetMapping
    public List<InsuranceCompanyResponseDTO> getAll() {
        return insuranceCompanyDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceCompanyResponseDTO> getById(@PathVariable Integer id) {
        return insuranceCompanyDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InsuranceCompanyResponseDTO> create(@RequestBody InsuranceCompanyRequestDTO dto) {
        return ResponseEntity.ok(insuranceCompanyDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceCompanyResponseDTO> update(@PathVariable Integer id, @RequestBody InsuranceCompanyRequestDTO dto) {
        return insuranceCompanyDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        insuranceCompanyDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}