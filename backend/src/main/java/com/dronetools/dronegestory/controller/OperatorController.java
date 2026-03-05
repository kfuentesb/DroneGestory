package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.service.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorService service;

    @GetMapping
    public List<Operator> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operator> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Operator create(@RequestBody Operator operator) {
        return service.save(operator);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operator> update(@PathVariable Integer id, @RequestBody Operator operator) {
        return service.findById(id)
                .map(existing -> {
                    operator.setId(existing.getId());
                    return ResponseEntity.ok(service.save(operator));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}