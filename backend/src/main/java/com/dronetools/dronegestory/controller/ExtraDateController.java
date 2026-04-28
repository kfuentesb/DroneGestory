package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.ExtraDateDTO;
import com.dronetools.dronegestory.service.ExtraDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/extra-dates")
public class ExtraDateController {
    @Autowired
    private ExtraDateService service;

    @PostMapping
    public ResponseEntity<ExtraDateDTO> create(@RequestBody ExtraDateDTO dto) {
        return ResponseEntity.ok(service.saveEvent(dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
