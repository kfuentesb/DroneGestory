package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.service.AircraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/aircraft")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AircraftController {

    private final AircraftService aircraftService;

    // Obtener todos los aircrafts
    @GetMapping
    public List<Aircraft> getAll() {
        return aircraftService.getAllAircrafts();
    }

    // Obtener un aircraft por id
    @GetMapping("/{id}")
    public ResponseEntity<Aircraft> getById(@PathVariable int id) {
        return aircraftService.getAircraftById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo aircraft
    @PostMapping
    public ResponseEntity<Aircraft> create(@RequestBody Aircraft aircraft) {
        Aircraft created = aircraftService.createAircraft(aircraft);
        return ResponseEntity.ok(created);
    }

    // Actualizar un aircraft existente
    @PutMapping("/{id}")
    public ResponseEntity<Aircraft> update(@PathVariable int id, @RequestBody Aircraft aircraft) {
        try {
            Aircraft updated = aircraftService.updateAircraft(id, aircraft);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar un aircraft por id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        try {
            aircraftService.deleteAircraft(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
