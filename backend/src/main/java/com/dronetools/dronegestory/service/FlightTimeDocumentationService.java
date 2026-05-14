package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.FlightTimeDocumentationDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.FlightTime;
import com.dronetools.dronegestory.model.FlightTimeDocumentation;
import com.dronetools.dronegestory.repository.FlightTimeDocumentationRepository;
import com.dronetools.dronegestory.repository.FlightTimeRepository;
import com.dronetools.dronegestory.util.UploadPathUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class FlightTimeDocumentationService {

    private final FlightTimeDocumentationRepository flightTimeDocumentationRepository;
    private final FlightTimeRepository flightTimeRepository;

    public FlightTimeDocumentationService(
            FlightTimeDocumentationRepository flightTimeDocumentationRepository,
            FlightTimeRepository flightTimeRepository
    ) {
        this.flightTimeDocumentationRepository = flightTimeDocumentationRepository;
        this.flightTimeRepository = flightTimeRepository;
    }

    @Transactional(readOnly = true)
    public Optional<FlightTimeDocumentationDTO> findById(Long id) {
        return flightTimeDocumentationRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<FlightTimeDocumentationDTO> findByFlightTimeId(Long flightTimeId) {
        return flightTimeDocumentationRepository.findByFlightTime_FlightTimeId(flightTimeId).map(this::toDto);
    }

    public FlightTimeDocumentationDTO createOrReplaceWithFile(
            Long flightTimeId,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        FlightTime flightTime = flightTimeRepository.findById(flightTimeId)
                .orElseThrow(() -> new EntityNotFoundException("Flight time not found with id: " + flightTimeId));

        FlightTimeDocumentation documentation = flightTimeDocumentationRepository.findByFlightTime_FlightTimeId(flightTimeId)
                .orElseGet(FlightTimeDocumentation::new);

        documentation.setFlightTime(flightTime);
        applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);

        FlightTimeDocumentation saved = flightTimeDocumentationRepository.save(documentation);
        flightTime.setDocumentation(saved);
        return toDto(saved);
    }

    public Optional<FlightTimeDocumentationDTO> updateWithFile(
            Long id,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return flightTimeDocumentationRepository.findById(id).map(documentation -> {
            applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
            return toDto(flightTimeDocumentationRepository.save(documentation));
        });
    }

    public void delete(Long id) {
        FlightTimeDocumentation documentation = flightTimeDocumentationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight time documentation not found with id: " + id));

        FlightTime flightTime = documentation.getFlightTime();
        if (flightTime != null) {
            flightTime.setDocumentation(null);
        }
        deleteStoredFile(documentation.getDocumentationName());
        flightTimeDocumentationRepository.delete(documentation);
    }

    public void deleteByFlightTimeId(Long flightTimeId) {
        flightTimeDocumentationRepository.findByFlightTime_FlightTimeId(flightTimeId).ifPresent(documentation -> {
            FlightTime flightTime = documentation.getFlightTime();
            if (flightTime != null) {
                flightTime.setDocumentation(null);
            }
            deleteStoredFile(documentation.getDocumentationName());
            flightTimeDocumentationRepository.delete(documentation);
        });
    }

    private void applyMetadataAndFile(
            FlightTimeDocumentation documentation,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        String effectiveType = documentationType == null || documentationType.isBlank()
                ? documentation.getDocumentationType()
                : documentationType.trim();

        if (effectiveType == null || effectiveType.isBlank()) {
            throw new IllegalArgumentException("documentationType is required");
        }

        LocalDate expireDate = null;
        if (expireDateRaw != null && !expireDateRaw.isBlank()) {
            expireDate = LocalDate.parse(expireDateRaw);
        }

        boolean indefinite = Boolean.TRUE.equals(dateIndefinite);
        documentation.setDocumentationType(effectiveType);
        documentation.setDateIndefinite(dateIndefinite);
        documentation.setExpireDate(indefinite ? null : expireDate);

        if (file != null && !file.isEmpty()) {
            String oldPath = documentation.getDocumentationName();
            String storedPath = storeDocumentationFile(documentation.getFlightTime(), effectiveType, file);
            documentation.setDocumentationName(storedPath);
            documentation.setFilePath(storedPath);
            if (oldPath != null && !oldPath.equals(storedPath)) {
                deleteStoredFile(oldPath);
            }
        }
    }

    private String storeDocumentationFile(FlightTime flightTime, String documentationType, MultipartFile file) {
        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();

            Aircraft aircraft = flightTime.getAircraft();
            String serialNumber = aircraft.getSerialNumber() != null ? aircraft.getSerialNumber() : "UNKNOWN";
            String modelName = (aircraft.getAircraftModel() != null && aircraft.getAircraftModel().getModel() != null)
                    ? aircraft.getAircraftModel().getModel()
                    : "UNKNOWN";

            String aircraftFolder = (serialNumber + "-" + modelName).replaceAll("[^a-zA-Z0-9_-]", "_");

            String flightDate = "UNKNOWN_DATE";
            if (flightTime.getFlightDate() != null) {
                flightDate = flightTime.getFlightDate().toString(); 
            }

            String flightTimeFolder = (flightTime.getFlightTimeId().toString() + "-" + flightDate)
                    .replaceAll("[^a-zA-Z0-9_-]", "_");

            Path targetDir = uploadsDir.resolve(Paths.get(
                    "aircraft",
                    aircraftFolder,
                    "flight-hours",
                    flightTimeFolder
            )).normalize();
            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "documentation"
                    : Paths.get(originalName).getFileName().toString();

            int dot = safeName.lastIndexOf('.');
            String baseName = dot >= 0 ? safeName.substring(0, dot) : safeName;
            String extension = dot >= 0 ? safeName.substring(dot) : "";
            
            String safeTypePrefix = documentationType.replaceAll("[^a-zA-Z0-9_-]", "_").toLowerCase();
            String filename = "flight_time_" + flightTime.getFlightTimeId() + "_" +
                    safeTypePrefix + "_" + baseName.replaceAll("[^a-zA-Z0-9_-]", "_") + extension;

            Path target = targetDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return Paths.get(
                    "aircraft",
                    aircraftFolder,
                    "flight-hours",
                    flightTimeFolder,
                    filename
            ).toString().replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Error storing flight time documentation", ex);
        }
    }

    private void deleteStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        try {
            UploadPathUtils.deleteFileAndPruneEmptyParents(relativePath);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting flight time documentation", ex);
        }
    }

    FlightTimeDocumentationDTO toDto(FlightTimeDocumentation documentation) {
        return new FlightTimeDocumentationDTO(
                documentation.getId(),
                documentation.getFlightTime() == null ? null : documentation.getFlightTime().getFlightTimeId(),
                documentation.getDocumentationType(),
                documentation.getDocumentationName(),
                documentation.getFilePath(),
                documentation.getExpireDate(),
                documentation.getDateIndefinite()
        );
    }
}
