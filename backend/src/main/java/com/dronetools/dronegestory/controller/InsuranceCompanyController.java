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

    private final InsuranceCompanyService insuranceCompanyService;

    @GetMapping
    public List<InsuranceCompany> getAll() {
        return insuranceCompanyService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceCompany> getById(@PathVariable Integer id) {
        return insuranceCompanyService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public InsuranceCompany create(@RequestBody InsuranceCompany insuranceCompany) {
        return insuranceCompanyService.save(insuranceCompany);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceCompany> update(@PathVariable Integer id, @RequestBody InsuranceCompany insuranceCompany) {
        return insuranceCompanyService.findById(id)
                .map(existing -> {
                    insuranceCompany.setId(existing.getId());
                    return ResponseEntity.ok(insuranceCompanyService.save(insuranceCompany));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        insuranceCompanyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}