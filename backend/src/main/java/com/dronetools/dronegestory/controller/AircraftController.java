package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.service.AircraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService service;

    @GetMapping
    public List<Aircraft> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aircraft> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Aircraft create(@RequestBody Aircraft aircraft) {
        return service.save(aircraft);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aircraft> update(@PathVariable Integer id, @RequestBody Aircraft aircraft) {
        return service.findById(id)
                .map(existing -> {
                    aircraft.setId(existing.getId());
                    return ResponseEntity.ok(service.save(aircraft));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}