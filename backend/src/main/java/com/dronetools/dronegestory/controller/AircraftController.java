package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.service.AircraftService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.beans.PropertyEditorSupport;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Aircraft> createAircraftWithFile(
            @ModelAttribute Aircraft aircraft, // Spring vincula los campos de texto aquí
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        // Si quieres depurar, añade estos logs:
        System.out.println("Modelo recibido: " + aircraft.getModel());
        if (imageFile != null) {
            System.out.println("Archivo: " + imageFile.getOriginalFilename());
        }
        
        Aircraft createdAircraft = aircraftService.createWithFile(aircraft, imageFile);
        return ResponseEntity.ok(createdAircraft);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Aircraft> updateAircraftAWithFile(
            @PathVariable Integer id,
            @ModelAttribute Aircraft aircraft,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "removeImage", required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request
    ) throws IOException {

        boolean mtomPresent = request.getParameterMap().containsKey("mtom");
        boolean wingspanPresent = request.getParameterMap().containsKey("wingspan");
        boolean maxSpeedPresent = request.getParameterMap().containsKey("maxSpeed");
        boolean impactEnergyPresent = request.getParameterMap().containsKey("impactEnergy");

        Aircraft updatedAircraft = aircraftService.updateWithFile(
            id, 
            aircraft, 
            imageFile, 
            removeImage,
            mtomPresent, 
            wingspanPresent, 
            maxSpeedPresent, 
            impactEnergyPresent
        );

        return ResponseEntity.ok(updatedAircraft);
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

    @GetMapping("/images/**")
    public ResponseEntity<Resource> getAircraftImage(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/aircraft/images/";
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

        // Detect content type
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
        
        binder.registerCustomEditor(BigDecimal.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                if (text == null || text.trim().isEmpty()) {
                    setValue(null);
                } else {
                    setValue(new BigDecimal(text.replace(',', '.'))); // Soporta comas y puntos
                }
            }
        });
    }
}
