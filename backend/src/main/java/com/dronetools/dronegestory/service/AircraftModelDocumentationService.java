package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftModelDocumentationDTO;
import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.model.AircraftModelDocumentation;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AircraftModelDocumentationService {

    private final AircraftModelDocumentationRepository aircraftModelDocumentationRepository;
    private final AircraftModelRepository aircraftModelRepository;
    private final AircraftDocumentationRepository aircraftDocumentationRepository;

    public AircraftModelDocumentationService(
            AircraftModelDocumentationRepository aircraftModelDocumentationRepository,
            AircraftModelRepository aircraftModelRepository,
            AircraftDocumentationRepository aircraftDocumentationRepository
    ) {
        this.aircraftModelDocumentationRepository = aircraftModelDocumentationRepository;
        this.aircraftModelRepository = aircraftModelRepository;
        this.aircraftDocumentationRepository = aircraftDocumentationRepository;
    }

    public List<AircraftModelDocumentation> findByModelId(Long modelId) {
        return aircraftModelDocumentationRepository.findByAircraftModel_Id(modelId);
    }

    public List<AircraftModelDocumentationDTO> findDtoByModelId(Long modelId) {
        return aircraftModelDocumentationRepository.findByAircraftModel_Id(modelId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<AircraftModelDocumentationDTO> createWithFile(
            Long modelId,
            String documentationType,
            String expireDate,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return aircraftModelRepository.findById(modelId).map(aircraftModel -> {
            LocalDate parsedExpireDate = parseExpireDate(expireDate);
            String storedDocumentationPath = null;
            if (file != null && !file.isEmpty()) {
                storedDocumentationPath = storeDocumentationFile(aircraftModel.getId(), documentationType, file);
            }

            boolean emptyDocumentation = (storedDocumentationPath == null || storedDocumentationPath.isBlank())
                    && parsedExpireDate == null
                    && dateIndefinite == null;
            if (emptyDocumentation) {
                return null;
            }

            AircraftModelDocumentation entity = new AircraftModelDocumentation();
            entity.setAircraftModel(aircraftModel);
            entity.setDocumentationType(documentationType);
            entity.setDocumentationName(storedDocumentationPath);
            entity.setExpireDate(parsedExpireDate);
            entity.setDateIndefinite(dateIndefinite);
            return toDto(aircraftModelDocumentationRepository.save(entity));
        });
    }

    private LocalDate parseExpireDate(String expireDate) {
        if (expireDate == null || expireDate.isBlank()) {
            return null;
        }
        return LocalDate.parse(expireDate);
    }

    public Optional<AircraftModelDocumentationDTO> updateWithFile(
            Long id,
            String documentationType,
            String expireDate,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return aircraftModelDocumentationRepository.findById(id)
                .map(existing -> {
                    if (documentationType != null && !documentationType.isBlank()) {
                        existing.setDocumentationType(documentationType);
                    }

                    if (expireDate != null) {
                        existing.setExpireDate(expireDate.isBlank() ? null : LocalDate.parse(expireDate));
                    }

                    if (dateIndefinite != null) {
                        existing.setDateIndefinite(dateIndefinite);
                    }

                    if (file != null && !file.isEmpty()) {
                        deleteStoredFile(existing.getDocumentationName());
                        String storedDocumentationPath = storeDocumentationFile(
                                existing.getAircraftModel().getId(),
                                existing.getDocumentationType(),
                                file
                        );
                        existing.setDocumentationName(storedDocumentationPath);
                    }

                    AircraftModelDocumentation saved = aircraftModelDocumentationRepository.save(existing);
                    
                    // Synchronize changes to all aircraft documentations pointing to this model documentation
                    syncPointingAircraftDocumentations(saved);
                    
                    return toDto(saved);
                });
    }

    private void syncPointingAircraftDocumentations(AircraftModelDocumentation modelDocumentation) {
        List<AircraftDocumentation> pointingDocs = aircraftDocumentationRepository.findByModelDocumentation_Id(modelDocumentation.getId());
        
        for (AircraftDocumentation aircraftDoc : pointingDocs) {
            // Only sync if aircraft documentation has no aircraft-specific file
            if (aircraftDoc.getDocumentationName() == null || aircraftDoc.getDocumentationName().isBlank()) {
                aircraftDoc.setDocumentationType(modelDocumentation.getDocumentationType());
                aircraftDoc.setExpireDate(modelDocumentation.getExpireDate());
                aircraftDoc.setDateIndefinite(modelDocumentation.getDateIndefinite());
                aircraftDocumentationRepository.save(aircraftDoc);
            }
        }
    }

    public void deleteById(Long id) {
        aircraftModelDocumentationRepository.findById(id).ifPresent(existing -> {
            deleteStoredFile(existing.getDocumentationName());
            
            // Break pointers: set modelDocumentation_id to NULL in all aircraft docs pointing to this model doc
            List<AircraftDocumentation> pointingDocs = aircraftDocumentationRepository.findByModelDocumentation_Id(id);
            for (AircraftDocumentation aircraftDoc : pointingDocs) {
                aircraftDoc.setModelDocumentation(null);
                aircraftDocumentationRepository.save(aircraftDoc);
            }
            
            // Delete the model documentation itself
            aircraftModelDocumentationRepository.deleteById(id);
        });
    }

    public void saveFromUploadRequests(
            AircraftModel aircraftModel,
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) {
        if (documentations == null || documentations.isEmpty()) {
            return;
        }

        for (AircraftDocumentationUploadRequest documentationRequest : documentations) {
            if (documentationRequest == null) {
                continue;
            }

            String documentationType = resolveDocumentationType(
                    documentationRequest.documentationType(),
                    documentationRequest.documentationLabel(),
                    documentationRequest.fileFieldKey()
            );
            if (Boolean.TRUE.equals(documentationRequest.removeDefault())) {
                continue;
            }
            String fileFieldKey = documentationRequest.fileFieldKey();
            Boolean dateIndefinite = documentationRequest.dateIndefinite();

            LocalDate expireDate = null;
            if (documentationRequest.expireDate() != null && !documentationRequest.expireDate().isBlank()) {
                expireDate = LocalDate.parse(documentationRequest.expireDate());
            }

            MultipartFile documentationFile = null;
            if (fileFieldKey != null && !fileFieldKey.isBlank()) {
                documentationFile = multipartRequest.getFile(fileFieldKey);
            }

            String storedDocumentationPath = null;
            if (documentationFile != null && !documentationFile.isEmpty()) {
                storedDocumentationPath = storeDocumentationFile(aircraftModel.getId(), documentationType, documentationFile);
            }

            boolean emptyDocumentation =
                    (storedDocumentationPath == null || storedDocumentationPath.isBlank()) &&
                            expireDate == null &&
                            dateIndefinite == null;

            if (emptyDocumentation) {
                continue;
            }

            AircraftModelDocumentation entity = new AircraftModelDocumentation();
            entity.setAircraftModel(aircraftModel);
            entity.setDocumentationType(documentationType);
            entity.setDocumentationName(storedDocumentationPath);
            entity.setExpireDate(expireDate);
            entity.setDateIndefinite(dateIndefinite);
            aircraftModelDocumentationRepository.save(entity);
        }
    }

    public void deleteByModelId(Long modelId) {
        List<AircraftModelDocumentation> docs = aircraftModelDocumentationRepository.findByAircraftModel_Id(modelId);
        for (AircraftModelDocumentation doc : docs) {
            deleteStoredFile(doc.getDocumentationName());
        }
        aircraftModelDocumentationRepository.deleteByAircraftModel_Id(modelId);
    }

    private String storeDocumentationFile(Long modelId, String documentationType, MultipartFile file) {
        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            String safeTypeDir = (documentationType == null || documentationType.isBlank())
                    ? "unknown"
                    : documentationType.replaceAll("[^a-zA-Z0-9_-]", "_");

            Path documentationTypeDir = uploadsDir.resolve(
                    Paths.get("aircraft-model", modelId.toString(), "documentation", safeTypeDir)
            ).normalize();
            Files.createDirectories(documentationTypeDir);

            String originalName = file.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "documentation"
                    : Paths.get(originalName).getFileName().toString();

            int dotIndex = safeName.lastIndexOf('.');
            String baseName = dotIndex > 0 ? safeName.substring(0, dotIndex) : safeName;
            String extension = dotIndex > 0 ? safeName.substring(dotIndex) : "";
            String sanitizedBaseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");

            String filename = modelId + "-" + safeTypeDir + "-" + sanitizedBaseName + extension;
            Path target = documentationTypeDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return Paths.get("aircraft-model", modelId.toString(), "documentation", safeTypeDir, filename)
                    .toString()
                    .replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Error storing model documentation file", ex);
        }
    }

    private void deleteStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path fullPath = uploadsDir.resolve(relativePath).normalize();
        if (!fullPath.startsWith(uploadsDir)) {
            return;
        }

        try {
            Files.deleteIfExists(fullPath);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting model documentation file", ex);
        }
    }

    private String resolveDocumentationType(String documentationType, String documentationLabel, String fileFieldKey) {
        if (documentationType != null && !documentationType.isBlank()) {
            return documentationType.trim();
        }

        if (documentationLabel != null && !documentationLabel.isBlank()) {
            return documentationLabel.trim();
        }

        if (fileFieldKey != null && !fileFieldKey.isBlank()) {
            return fileFieldKey.replaceFirst("^documentation_", "").trim();
        }

        return null;
    }

    private AircraftModelDocumentationDTO toDto(AircraftModelDocumentation documentation) {
        return new AircraftModelDocumentationDTO(
                documentation.getId(),
                documentation.getAircraftModel().getId(),
                documentation.getDocumentationType(),
                documentation.getDocumentationName(),
                documentation.getExpireDate(),
                documentation.getDateIndefinite()
        );
    }
}
