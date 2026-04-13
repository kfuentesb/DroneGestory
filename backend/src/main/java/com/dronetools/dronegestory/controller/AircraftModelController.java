package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.aircraft.AircraftModelDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelRequestDTO;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.service.AircraftModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft-models")
@RequiredArgsConstructor
public class AircraftModelController {

    private final AircraftModelService aircraftModelService;

    @GetMapping
    public List<AircraftModelDTO> getAll() {
        return aircraftModelService.getAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping
    public ResponseEntity<AircraftModelDTO> create(@RequestBody AircraftModelRequestDTO request) {
        AircraftModel created = aircraftModelService.create(request.manufacturer(), request.model());
        return ResponseEntity.ok(toDto(created));
    }

    private AircraftModelDTO toDto(AircraftModel model) {
        return new AircraftModelDTO(
                model.getId(),
                model.getManufacturer(),
                model.getModel()
        );
    }
}
