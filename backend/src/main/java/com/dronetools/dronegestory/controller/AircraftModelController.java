package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.aircraft.AircraftModelDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelRequestDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelUpdateDTO;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.service.AircraftModelService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @GetMapping("/{id}")
    public ResponseEntity<AircraftModelDTO> getById(@PathVariable Long id) {
        return aircraftModelService.getById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AircraftModelDTO> create(@RequestBody AircraftModelRequestDTO request) {
        AircraftModel created = aircraftModelService.create(request);
        return ResponseEntity.ok(toDto(created));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AircraftModelDTO> update(
            @PathVariable Long id,
            @ModelAttribute AircraftModelUpdateDTO dto,
            HttpServletRequest request
    ) {
        AircraftModel updated = aircraftModelService.update(id, dto, request.getParameterMap());
        return ResponseEntity.ok(toDto(updated));
    }

    private AircraftModelDTO toDto(AircraftModel model) {
        return new AircraftModelDTO(
                model.getId(),
                model.getManufacturer(),
                model.getModel(),
                model.getAircraftClassDefault(),
                model.getMtomDefault(),
                model.getWingspanDefault(),
                model.getMaxSpeedDefault(),
                model.getConfigDefault(),
                model.getImpactEnergyDefault(),
                model.getHasCameraDefault(),
                model.getPrivatelyBuiltDefault(),
                model.getHasParachuteDefault(),
                model.getHasEnsuranceDefault(),
                model.getHasFTSDefault(),
                model.getCautiveDefault(),
                model.getAccessoriesDefault()
        );
    }
}
