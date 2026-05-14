package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftModelDocumentationDTO;
import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.model.AircraftModelDocumentation;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import com.dronetools.dronegestory.util.UploadPathUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
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
            String storedDocumentationName = null;
            if (file != null && !file.isEmpty()) {
                storedDocumentationName = storeDocumentationFile(aircraftModel, documentationType, file);
            }

            boolean emptyDocumentation = (storedDocumentationName == null || storedDocumentationName.isBlank())
                    && parsedExpireDate == null
                    && dateIndefinite == null;
            if (emptyDocumentation) {
                return null;
            }

            AircraftModelDocumentation entity = new AircraftModelDocumentation();
            entity.setAircraftModel(aircraftModel);
            entity.setDocumentationType(documentationType);
            entity.setDocumentationName(storedDocumentationName);
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
                    String previousDocumentationType = existing.getDocumentationType();
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
                        deleteStoredFile(existing.getAircraftModel().getId(), previousDocumentationType, existing.getDocumentationName());
                        String storedDocumentationName = storeDocumentationFile(
                                existing.getAircraftModel(),
                                existing.getDocumentationType(),
                                file
                        );
                        existing.setDocumentationName(storedDocumentationName);
                    } else if (!Objects.equals(previousDocumentationType, existing.getDocumentationType())) {
                        moveStoredFileToType(existing, previousDocumentationType, existing.getDocumentationType());
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
            deleteStoredFile(existing.getAircraftModel().getId(), existing.getDocumentationType(), existing.getDocumentationName());
            
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

            String storedDocumentationName = null;
            if (documentationFile != null && !documentationFile.isEmpty()) {
                storedDocumentationName = storeDocumentationFile(aircraftModel, documentationType, documentationFile);
            }

            boolean emptyDocumentation =
                    (storedDocumentationName == null || storedDocumentationName.isBlank()) &&
                            expireDate == null &&
                            dateIndefinite == null;

            if (emptyDocumentation) {
                continue;
            }

            AircraftModelDocumentation entity = new AircraftModelDocumentation();
            entity.setAircraftModel(aircraftModel);
            entity.setDocumentationType(documentationType);
            entity.setDocumentationName(storedDocumentationName);
            entity.setExpireDate(expireDate);
            entity.setDateIndefinite(dateIndefinite);
            aircraftModelDocumentationRepository.save(entity);
        }
    }

    public void deleteByModelId(Long modelId) {
        List<AircraftModelDocumentation> docs = aircraftModelDocumentationRepository.findByAircraftModel_Id(modelId);
        for (AircraftModelDocumentation doc : docs) {
            deleteStoredFile(modelId, doc.getDocumentationType(), doc.getDocumentationName());
        }
        aircraftModelDocumentationRepository.deleteByAircraftModel_Id(modelId);
    }

    private String storeDocumentationFile(AircraftModel aircraftModel, String documentationType, MultipartFile file) {
        try {
            Path uploadsDir = UploadPathUtils.databaseManagedRoot();
            String safeTypeDir = safeTypeDir(documentationType);

            Path documentationTypeDir = uploadsDir.resolve(
                    Paths.get("aircraft-model", aircraftModelFolder(aircraftModel), "documentation", safeTypeDir)
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

            String filename = aircraftModel.getId() + "-" + safeTypeDir + "-" + sanitizedBaseName + extension;
            Path target = documentationTypeDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return UploadPathUtils.databaseRelativePathString("aircraft-model", aircraftModelFolder(aircraftModel), "documentation", safeTypeDir, filename);
        } catch (IOException ex) {
            throw new RuntimeException("Error storing model documentation file", ex);
        }
    }

    private void deleteStoredFile(Long modelId, String documentationType, String documentationName) {
        String relativePath = resolveStoredDocumentationPath(modelId, documentationType, documentationName);
        if (relativePath == null) {
            return;
        }

        try {
            UploadPathUtils.deleteFileAndPruneEmptyParents(relativePath);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting model documentation file", ex);
        }
    }

    private void moveStoredFileToType(AircraftModelDocumentation documentation, String oldType, String newType) {
        String documentationName = documentation.getDocumentationName();
        if (documentationName == null || documentationName.isBlank()
                || documentationName.contains("/") || documentationName.contains("\\")) {
            return;
        }

        String oldRelativePath = resolveStoredDocumentationPath(documentation.getAircraftModel().getId(), oldType, documentationName);
        String newRelativePath = resolveStoredDocumentationPath(documentation.getAircraftModel().getId(), newType, documentationName);
        if (oldRelativePath == null || newRelativePath == null || Objects.equals(oldRelativePath, newRelativePath)) {
            return;
        }

        Path uploadsDir = UploadPathUtils.uploadsRoot();
        Path oldPath = uploadsDir.resolve(oldRelativePath).normalize();
        Path newPath = uploadsDir.resolve(newRelativePath).normalize();
        if (!oldPath.startsWith(uploadsDir) || !newPath.startsWith(uploadsDir) || !Files.exists(oldPath)) {
            return;
        }

        try {
            Files.createDirectories(newPath.getParent());
            Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Error moving model documentation file", ex);
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
                resolveStoredDocumentationPath(
                        documentation.getAircraftModel().getId(),
                        documentation.getDocumentationType(),
                        documentation.getDocumentationName()
                ),
                documentation.getExpireDate(),
                documentation.getDateIndefinite()
        );
    }

    private String resolveStoredDocumentationPath(Long modelId, String documentationType, String documentationName) {
        if (documentationName == null || documentationName.isBlank()) {
            return null;
        }
        String normalized = documentationName.replace("\\", "/");
        if (normalized.contains("/")) {
            return UploadPathUtils.toDatabaseRelativePath(normalized);
        }
        String newRelativePath = aircraftModelRepository.findById(modelId)
                .map(model -> UploadPathUtils.databaseRelativePathString("aircraft-model", aircraftModelFolder(model), "documentation", safeTypeDir(documentationType), normalized))
                .orElseGet(() -> UploadPathUtils.databaseRelativePathString("aircraft-model", modelId.toString(), "documentation", safeTypeDir(documentationType), normalized));
        Path newPath = UploadPathUtils.uploadsRoot().resolve(newRelativePath).normalize();
        if (Files.exists(newPath)) {
            return newRelativePath;
        }
        String legacyNamedRelativePath = aircraftModelRepository.findById(modelId)
                .map(model -> UploadPathUtils.databaseRelativePath(
                                "aircraft-model",
                                UploadPathUtils.legacyAircraftModelFolder(model.getManufacturer(), model.getModel()),
                                "documentation",
                                safeTypeDir(documentationType),
                                normalized
                        )
                        .toString()
                        .replace("\\", "/"))
                .orElse(null);
        if (legacyNamedRelativePath != null
                && Files.exists(UploadPathUtils.uploadsRoot().resolve(legacyNamedRelativePath).normalize())) {
            return legacyNamedRelativePath;
        }
        return UploadPathUtils.databaseRelativePathString("aircraft-model", modelId.toString(), "documentation", safeTypeDir(documentationType), normalized);
    }

    private String safeTypeDir(String documentationType) {
        return (documentationType == null || documentationType.isBlank())
                ? "unknown"
                : documentationType.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private String aircraftModelFolder(AircraftModel model) {
        return UploadPathUtils.aircraftModelFolder(model.getManufacturer(), model.getModel());
    }
}
