package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.InsuranceCompany;
import com.dronetools.dronegestory.service.InsuranceCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance-companies")
@RequiredArgsConstructor
public class InsuranceCompanyController {

    private final InsuranceCompanyService service;

    @GetMapping
    public List<InsuranceCompany> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceCompany> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public InsuranceCompany create(@RequestBody InsuranceCompany insuranceCompany) {
        return service.save(insuranceCompany);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceCompany> update(@PathVariable Integer id, @RequestBody InsuranceCompany insuranceCompany) {
        return service.findById(id)
                .map(existing -> {
                    insuranceCompany.setId(existing.getId());
                    return ResponseEntity.ok(service.save(insuranceCompany));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}