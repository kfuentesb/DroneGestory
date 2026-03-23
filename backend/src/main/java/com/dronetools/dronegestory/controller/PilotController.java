package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.service.PilotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/pilots")
@RequiredArgsConstructor
public class PilotController {

    private final PilotService pilotService;

    // Obtener todos los pilotos
    @GetMapping
    public List<Pilot> getAll() {
        return pilotService.getAllPilots();
    }

    // Obtener un piloto por id
    @GetMapping("/{id}")
    public ResponseEntity<Pilot> getById(@PathVariable int id) {
        return pilotService.getPilotById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo piloto
    @PostMapping
    public ResponseEntity<Pilot> create(@RequestBody Pilot pilot) {
        Pilot created = pilotService.createPilot(pilot);
        return ResponseEntity.ok(created);
    }

    // Actualizar un piloto existente
    @PutMapping("/{id}")
    public ResponseEntity<Pilot> update(@PathVariable int id, @RequestBody Pilot pilot) {
        try {
            Pilot updated = pilotService.updatePilot(id, pilot);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar un piloto por id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        try {
            pilotService.deletePilot(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
