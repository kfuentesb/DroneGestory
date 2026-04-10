package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.dto.aircraft.AircraftRequestDTO;
import com.dronetools.dronegestory.dto.aircraft.AircraftResponseDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.service.AircraftService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.beans.PropertyEditorSupport;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService aircraftService;

    @GetMapping
    public List<AircraftResponseDTO> getAll() {
        return aircraftService.getAllAircrafts()
                .stream()
                .map(AircraftResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AircraftResponseDTO> getById(@PathVariable int id) {
        return aircraftService.getAircraftById(id)
                .map(AircraftResponseDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AircraftResponseDTO> createAircraftWithFile(
            @ModelAttribute AircraftRequestDTO dto,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "documentations", required = false) String documentationsJson,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        List<AircraftDocumentationUploadRequest> documentations = Collections.emptyList();
        if (documentationsJson != null && !documentationsJson.isBlank()) {
            documentations = new ObjectMapper().readValue(
                    documentationsJson,
                    new TypeReference<List<AircraftDocumentationUploadRequest>>() {}
            );
        }

        // We use the manufacturer/model from DTO to handle the relationship in Service
        // Note: dto.toEntity() now likely returns an Aircraft without the model set, 
        // or you can adjust your service to handle the dto directly.
        
        Aircraft createdAircraft = aircraftService.createWithFileAndDocumentation(
                dto.toEntity(null), // Pass null model initially, service will link it
                dto.getManufacturer(),
                dto.getModel(),
                imageFile,
                documentations,
                multipartRequest
        );
        
        return ResponseEntity.ok(AircraftResponseDTO.fromEntity(createdAircraft));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AircraftResponseDTO> updateAircraftWithFile(
            @PathVariable Integer id,
            @ModelAttribute AircraftRequestDTO dto,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "removeImage", required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request
    ) throws IOException {
        
        // Map presence booleans for partial updates
        boolean mtomPresent = request.getParameterMap().containsKey("mtom");
        boolean wingspanPresent = request.getParameterMap().containsKey("wingspan");
        boolean maxSpeedPresent = request.getParameterMap().containsKey("maxSpeed");
        boolean impactEnergyPresent = request.getParameterMap().containsKey("impactEnergy");
        boolean privatelyBuiltPresent = request.getParameterMap().containsKey("privatelyBuilt");
        boolean hasParachutePresent = request.getParameterMap().containsKey("hasParachute");
        boolean hasEnsurancePresent = request.getParameterMap().containsKey("hasEnsurance");
        boolean hasFTSPresent = request.getParameterMap().containsKey("hasFTS");
        boolean cautivePresent = request.getParameterMap().containsKey("cautive");
        boolean accessoriesPresent = request.getParameterMap().containsKey("accessories");

        Aircraft updatedAircraft = aircraftService.updateWithFile(
                id,
                dto.toEntity(null), // Data container
                dto.getManufacturer(),
                dto.getModel(),
                imageFile,
                removeImage,
                mtomPresent,
                wingspanPresent,
                maxSpeedPresent,
                impactEnergyPresent,
                privatelyBuiltPresent,
                hasParachutePresent,
                hasEnsurancePresent,
                hasFTSPresent,
                cautivePresent,
                accessoriesPresent
        );

        return ResponseEntity.ok(AircraftResponseDTO.fromEntity(updatedAircraft));
    }
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

        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

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
                    setValue(new BigDecimal(text.replace(',', '.')));
                }
            }
        });
    }
}
