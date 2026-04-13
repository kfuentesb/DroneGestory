package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.aircraft.AircraftModelDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelRequestDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftModelUpdateDTO;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.service.AircraftModelService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AircraftModelDTO> create(
            @ModelAttribute AircraftModelRequestDTO request,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        AircraftModel created = aircraftModelService.create(request, imageFile);
        return ResponseEntity.ok(toDto(created));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AircraftModelDTO> update(
            @PathVariable Long id,
            @ModelAttribute AircraftModelUpdateDTO dto,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "removeImage", required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request
    ) throws IOException {
        AircraftModel updated = aircraftModelService.update(id, dto, imageFile, removeImage, request.getParameterMap());
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            aircraftModelService.deleteModelAndAircrafts(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException | IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/images/**")
    public ResponseEntity<Resource> getModelImage(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/aircraft-models/images/";
        int markerIndex = requestUri.indexOf(marker);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }

        String filename = requestUri.substring(markerIndex + marker.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path file = uploadsDir.resolve(filename).normalize();

        if (!file.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    private AircraftModelDTO toDto(AircraftModel model) {
        return new AircraftModelDTO(
                model.getId(),
                model.getManufacturer(),
                model.getModel(),
                model.getImagePath(),
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
