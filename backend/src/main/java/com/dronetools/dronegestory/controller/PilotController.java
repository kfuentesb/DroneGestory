package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.service.PilotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilots")
@RequiredArgsConstructor
public class PilotController {

    private final PilotService pilotService;

    @GetMapping
    public List<Pilot> getAll() {
        return pilotService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pilot> getById(@PathVariable Integer id) {
        return pilotService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pilot create(@RequestBody Pilot pilot) {
        return pilotService.save(pilot);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pilot> update(@PathVariable Integer id, @RequestBody Pilot pilot) {
        return pilotService.findById(id)
                .map(existing -> {
                    pilot.setId(existing.getId());
                    return ResponseEntity.ok(pilotService.save(pilot));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pilotService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}