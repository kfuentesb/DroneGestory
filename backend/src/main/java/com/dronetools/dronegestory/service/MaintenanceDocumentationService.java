package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.MaintenanceDocumentationDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.Maintenance;
import com.dronetools.dronegestory.model.MaintenanceDocumentation;
import com.dronetools.dronegestory.repository.MaintenanceDocumentationRepository;
import com.dronetools.dronegestory.repository.MaintenanceRepository;
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
public class MaintenanceDocumentationService {

    private final MaintenanceDocumentationRepository maintenanceDocumentationRepository;
    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceDocumentationService(
            MaintenanceDocumentationRepository maintenanceDocumentationRepository,
            MaintenanceRepository maintenanceRepository
    ) {
        this.maintenanceDocumentationRepository = maintenanceDocumentationRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Transactional(readOnly = true)
    public Optional<MaintenanceDocumentationDTO> findById(Long id) {
        return maintenanceDocumentationRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<MaintenanceDocumentationDTO> findByMaintenanceId(Long maintenanceId) {
        return maintenanceDocumentationRepository.findByMaintenance_MaintenanceId(maintenanceId).map(this::toDto);
    }

    public MaintenanceDocumentationDTO createOrReplaceWithFile(
            Long maintenanceId,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance not found with id: " + maintenanceId));

        MaintenanceDocumentation documentation = maintenanceDocumentationRepository.findByMaintenance_MaintenanceId(maintenanceId)
                .orElseGet(MaintenanceDocumentation::new);

        documentation.setMaintenance(maintenance);
        applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);

        MaintenanceDocumentation saved = maintenanceDocumentationRepository.save(documentation);
        maintenance.setDocumentation(saved);
        return toDto(saved);
    }

    public Optional<MaintenanceDocumentationDTO> updateWithFile(
            Long id,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return maintenanceDocumentationRepository.findById(id).map(documentation -> {
            applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
            return toDto(maintenanceDocumentationRepository.save(documentation));
        });
    }

    public void delete(Long id) {
        MaintenanceDocumentation documentation = maintenanceDocumentationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance documentation not found with id: " + id));

        Maintenance maintenance = documentation.getMaintenance();
        if (maintenance != null) {
            maintenance.setDocumentation(null);
        }
        deleteStoredFile(documentation.getDocumentationName());
        maintenanceDocumentationRepository.delete(documentation);
    }

    public void deleteByMaintenanceId(Long maintenanceId) {
        maintenanceDocumentationRepository.findByMaintenance_MaintenanceId(maintenanceId).ifPresent(documentation -> {
            Maintenance maintenance = documentation.getMaintenance();
            if (maintenance != null) {
                maintenance.setDocumentation(null);
            }
            deleteStoredFile(documentation.getDocumentationName());
            maintenanceDocumentationRepository.delete(documentation);
        });
    }

    MaintenanceDocumentationDTO toDto(MaintenanceDocumentation documentation) {
        return new MaintenanceDocumentationDTO(
                documentation.getId(),
                documentation.getMaintenance() == null ? null : documentation.getMaintenance().getMaintenanceId(),
                documentation.getDocumentationType(),
                documentation.getDocumentationName(),
                documentation.getFilePath(),
                documentation.getExpireDate(),
                documentation.getDateIndefinite()
        );
    }

    private void applyMetadataAndFile(
            MaintenanceDocumentation documentation,
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
            String storedPath = storeDocumentationFile(documentation.getMaintenance(), effectiveType, file);
            documentation.setDocumentationName(storedPath);
            documentation.setFilePath(storedPath);
            if (oldPath != null && !oldPath.equals(storedPath)) {
                deleteStoredFile(oldPath);
            }
        }
    }

    private String storeDocumentationFile(Maintenance maintenance, String documentationType, MultipartFile file) {
        try {
            Path uploadsDir = UploadPathUtils.databaseManagedRoot();

            Aircraft aircraft = maintenance.getAircraft();
            String serialNumber = aircraft.getSerialNumber() != null ? aircraft.getSerialNumber() : "UNKNOWN";
            String modelName = (aircraft.getAircraftModel() != null && aircraft.getAircraftModel().getModel() != null) 
                    ? aircraft.getAircraftModel().getModel() 
                    : "UNKNOWN";
            
            String aircraftFolder = (serialNumber + "-" + modelName).replaceAll("[^a-zA-Z0-9_-]", "_");

            String maintenanceDate = "UNKNOWN_DATE";
            if (maintenance.getMaintenanceDate() != null) {
                maintenanceDate = maintenance.getMaintenanceDate().toString();
            }

            String maintenanceFolder = (maintenance.getMaintenanceId().toString() + "-" + maintenanceDate)
                    .replaceAll("[^a-zA-Z0-9_-]", "_");

            Path targetDir = uploadsDir.resolve(Paths.get(
                    "aircraft",
                    aircraftFolder,
                    "maintenance",
                    maintenanceFolder
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
            String filename = "maintenance_" + maintenance.getMaintenanceId() + "_" +
                    safeTypePrefix + "_" + baseName.replaceAll("[^a-zA-Z0-9_-]", "_") + extension;

            Path target = targetDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return UploadPathUtils.databaseRelativePathString(
                    "aircraft",
                    aircraftFolder,
                    "maintenance",
                    maintenanceFolder,
                    filename
                );
        } catch (IOException ex) {
            throw new RuntimeException("Error storing maintenance documentation", ex);
        }
    }
    private void deleteStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        try {
            UploadPathUtils.deleteFileAndPruneEmptyParents(relativePath);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting maintenance documentation", ex);
        }
    }
}
