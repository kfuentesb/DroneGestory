package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService service;

    @GetMapping
    public List<Operation> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operation> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Operation create(@RequestBody Operation operation) {
        return service.save(operation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operation> update(@PathVariable Integer id, @RequestBody Operation operation) {
        return service.findById(id)
                .map(existing -> {
                    operation.setId(existing.getId());
                    return ResponseEntity.ok(service.save(operation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}