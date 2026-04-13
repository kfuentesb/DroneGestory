package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftDocumentationDTO;
import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.AircraftModelDocumentation;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AircraftDocumentationService {

    private final AircraftDocumentationRepository aircraftDocumentationRepository;
    private final AircraftModelDocumentationRepository aircraftModelDocumentationRepository;
    private final AircraftRepository aircraftRepository;

    public AircraftDocumentationService(
            AircraftDocumentationRepository aircraftDocumentationRepository,
            AircraftModelDocumentationRepository aircraftModelDocumentationRepository,
            AircraftRepository aircraftRepository
    ) {
        this.aircraftDocumentationRepository = aircraftDocumentationRepository;
        this.aircraftModelDocumentationRepository = aircraftModelDocumentationRepository;
        this.aircraftRepository = aircraftRepository;
    }

    public List<AircraftDocumentationDTO> findByAircraftId(Long aircraftId) {
        List<AircraftDocumentation> raw = aircraftDocumentationRepository.findByAircraft_AircraftId(aircraftId);
        Map<String, AircraftDocumentation> byType = new HashMap<>();

        for (AircraftDocumentation documentation : raw) {
            String type = resolveEffectiveType(documentation);
            if (type == null || type.isBlank()) {
                continue;
            }

            AircraftDocumentation existing = byType.get(type);
            if (existing == null || isSpecificDocumentation(documentation)) {
                byType.put(type, documentation);
            }
        }

        return byType.values().stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<AircraftDocumentationDTO> updateWithFile(
            Long id,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return aircraftDocumentationRepository.findById(id).map(documentation -> {
            if (documentation.getModelDocumentation() != null) {
                boolean shouldKeepPointer = shouldKeepPointerLink(documentation, documentationType, expireDateRaw, dateIndefinite, file);
                if (!shouldKeepPointer) {
                    documentation.setModelDocumentation(null);
                    documentation.setDocumentationName(null);
                    documentation.setExpireDate(null);
                    documentation.setDateIndefinite(null);
                }
            }

            documentation.setDocumentationType(documentationType);
            applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
            return toDto(aircraftDocumentationRepository.save(documentation));
        });
    }

    public AircraftDocumentationDTO createWithFile(
            Long aircraftId,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        Aircraft aircraft = aircraftRepository.findById(aircraftId)
                .orElseThrow(() -> new RuntimeException("Aircraft not found with id: " + aircraftId));

        AircraftDocumentation documentation = new AircraftDocumentation();
        documentation.setAircraft(aircraft);
        documentation.setDocumentationType(documentationType);
        documentation.setModelDocumentation(null);
        applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
        return toDto(aircraftDocumentationRepository.save(documentation));
    }

    public void initializeFromModelAndSpecificUploads(
            Aircraft aircraft,
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) {
        List<AircraftModelDocumentation> modelDocumentations =
                aircraftModelDocumentationRepository.findByAircraftModel_Id(aircraft.getAircraftModel().getId());

        Set<String> overriddenTypes = extractOverriddenTypes(documentations, multipartRequest);

        saveFromUploadRequests(aircraft, documentations, multipartRequest);

        for (AircraftModelDocumentation modelDocumentation : modelDocumentations) {
            String documentationType = modelDocumentation.getDocumentationType();
            if (documentationType == null || documentationType.isBlank()) {
                continue;
            }
            if (overriddenTypes.contains(documentationType)) {
                continue;
            }

            AircraftDocumentation pointer = new AircraftDocumentation();
            pointer.setAircraft(aircraft);
            pointer.setDocumentationType(documentationType);
            pointer.setModelDocumentation(modelDocumentation);
            aircraftDocumentationRepository.save(pointer);
        }
    }

    public void saveFromUploadRequests(
            Aircraft aircraft,
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
                storedDocumentationPath = storeDocumentationFile(aircraft.getAircraftId(), documentationType, documentationFile);
            }

            boolean emptyDocumentation =
                    (storedDocumentationPath == null || storedDocumentationPath.isBlank()) &&
                            expireDate == null &&
                            dateIndefinite == null;

            if (emptyDocumentation) {
                continue;
            }

            AircraftDocumentation entity = new AircraftDocumentation();
            entity.setAircraft(aircraft);
            entity.setDocumentationType(documentationType);
            entity.setModelDocumentation(null);
            entity.setDocumentationName(storedDocumentationPath);
            entity.setExpireDate(expireDate);
            entity.setDateIndefinite(dateIndefinite);
            aircraftDocumentationRepository.save(entity);
        }
    }

    public void deleteById(Long id) {
        AircraftDocumentation documentation = aircraftDocumentationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft documentation not found with id: " + id));
        deleteStoredFile(documentation.getDocumentationName());
        aircraftDocumentationRepository.delete(documentation);
    }

    public void deleteByAircraftId(Long aircraftId) {
        List<AircraftDocumentation> docs = aircraftDocumentationRepository.findByAircraft_AircraftId(aircraftId);
        for (AircraftDocumentation doc : docs) {
            deleteStoredFile(doc.getDocumentationName());
        }
        aircraftDocumentationRepository.deleteByAircraft_AircraftId(aircraftId);
    }

    private void applyMetadataAndFile(
            AircraftDocumentation documentation,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        LocalDate expireDate = null;
        if (expireDateRaw != null && !expireDateRaw.isBlank()) {
            expireDate = LocalDate.parse(expireDateRaw);
        }

        boolean indefinite = Boolean.TRUE.equals(dateIndefinite);
        documentation.setDateIndefinite(dateIndefinite);
        documentation.setExpireDate(indefinite ? null : expireDate);

        if (file != null && !file.isEmpty()) {
            String oldPath = documentation.getDocumentationName();
            String storedPath = storeDocumentationFile(documentation.getAircraft().getAircraftId(), documentationType, file);
            documentation.setDocumentationName(storedPath);
            deleteStoredFile(oldPath);
        }
    }

    private String storeDocumentationFile(Long aircraftId, String documentationType, MultipartFile file) {
        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            String safeTypeDir = (documentationType == null || documentationType.isBlank())
                    ? "unknown"
                    : documentationType.replaceAll("[^a-zA-Z0-9_-]", "_");

            Path documentationTypeDir = uploadsDir.resolve(
                    Paths.get("aircraft", aircraftId.toString(), "documentation", safeTypeDir)
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

            String filename = aircraftId + "-" + safeTypeDir + "-" + sanitizedBaseName + extension;
            Path target = documentationTypeDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return Paths.get("aircraft", aircraftId.toString(), "documentation", safeTypeDir, filename)
                    .toString()
                    .replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Error storing documentation file", ex);
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
            throw new RuntimeException("Error deleting documentation file", ex);
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

    private AircraftDocumentationDTO toDto(AircraftDocumentation documentation) {
        String documentationType = documentation.getDocumentationType();
        String documentationName = documentation.getDocumentationName();
        LocalDate expireDate = documentation.getExpireDate();
        Boolean dateIndefinite = documentation.getDateIndefinite();

        if (documentation.getModelDocumentation() != null) {
            AircraftModelDocumentation modelDocumentation = documentation.getModelDocumentation();
            documentationType = firstNonBlank(documentationType, modelDocumentation.getDocumentationType());
            documentationName = firstNonBlank(documentationName, modelDocumentation.getDocumentationName());
            expireDate = expireDate != null ? expireDate : modelDocumentation.getExpireDate();
            dateIndefinite = dateIndefinite != null ? dateIndefinite : modelDocumentation.getDateIndefinite();
        }

        return new AircraftDocumentationDTO(
                documentation.getId(),
                documentation.getAircraft().getAircraftId(),
                documentationType,
                documentationName,
                expireDate,
                dateIndefinite
        );
    }

    private String resolveEffectiveType(AircraftDocumentation documentation) {
        if (documentation.getDocumentationType() != null && !documentation.getDocumentationType().isBlank()) {
            return documentation.getDocumentationType();
        }
        if (documentation.getModelDocumentation() != null) {
            return documentation.getModelDocumentation().getDocumentationType();
        }
        return null;
    }

    private boolean isSpecificDocumentation(AircraftDocumentation documentation) {
        return documentation.getModelDocumentation() == null;
    }

    private Set<String> extractOverriddenTypes(
            List<AircraftDocumentationUploadRequest> documentations,
            MultipartHttpServletRequest multipartRequest
    ) {
        Set<String> overriddenTypes = new HashSet<>();
        if (documentations == null) {
            return overriddenTypes;
        }

        for (AircraftDocumentationUploadRequest request : documentations) {
            if (request == null) continue;

            String type = resolveDocumentationType(request.documentationType(), request.documentationLabel(), request.fileFieldKey());
            if (type == null || type.isBlank()) continue;

            MultipartFile file = null;
            if (request.fileFieldKey() != null && !request.fileFieldKey().isBlank()) {
                file = multipartRequest.getFile(request.fileFieldKey());
            }

            boolean hasAnyData =
                    (file != null && !file.isEmpty()) ||
                            (request.expireDate() != null && !request.expireDate().isBlank()) ||
                            request.dateIndefinite() != null ||
                            Boolean.TRUE.equals(request.removeDefault());

            if (hasAnyData) {
                overriddenTypes.add(type);
            }
        }

        return overriddenTypes;
    }

    private boolean shouldKeepPointerLink(
            AircraftDocumentation documentation,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        AircraftModelDocumentation modelDocumentation = documentation.getModelDocumentation();
        if (modelDocumentation == null) return false;
        if (file != null && !file.isEmpty()) return false;

        String requestedType = documentationType == null || documentationType.isBlank()
                ? modelDocumentation.getDocumentationType()
                : documentationType.trim();

        LocalDate requestedExpireDate = null;
        if (expireDateRaw != null && !expireDateRaw.isBlank()) {
            requestedExpireDate = LocalDate.parse(expireDateRaw);
        }

        Boolean requestedIndefinite = dateIndefinite;
        LocalDate normalizedRequestedExpire = Boolean.TRUE.equals(requestedIndefinite) ? null : requestedExpireDate;
        LocalDate normalizedModelExpire = Boolean.TRUE.equals(modelDocumentation.getDateIndefinite()) ? null : modelDocumentation.getExpireDate();

        return Objects.equals(requestedType, modelDocumentation.getDocumentationType())
                && Objects.equals(requestedIndefinite, modelDocumentation.getDateIndefinite())
                && Objects.equals(normalizedRequestedExpire, normalizedModelExpire);
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }
}
