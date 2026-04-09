package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AircraftDocumentationDTO;
import com.dronetools.dronegestory.dto.AircraftDocumentationUploadRequest;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftRepository;
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

@Service
public class AircraftDocumentationService {

    private final AircraftDocumentationRepository aircraftDocumentationRepository;
    private final AircraftRepository aircraftRepository;

    public AircraftDocumentationService(
            AircraftDocumentationRepository aircraftDocumentationRepository,
            AircraftRepository aircraftRepository
    ) {
        this.aircraftDocumentationRepository = aircraftDocumentationRepository;
        this.aircraftRepository = aircraftRepository;
    }

    public List<AircraftDocumentationDTO> findByAircraftId(Integer aircraftId) {
        return aircraftDocumentationRepository.findByAircraftId(aircraftId).stream().map(this::toDto).toList();
    }

    public Optional<AircraftDocumentationDTO> updateWithFile(
            Integer id,
            String documentationType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return aircraftDocumentationRepository.findById(id).map(documentation -> {
            documentation.setDocumentationType(documentationType);
            applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
            return toDto(aircraftDocumentationRepository.save(documentation));
        });
    }

    public AircraftDocumentationDTO createWithFile(
            Integer aircraftId,
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
        applyMetadataAndFile(documentation, documentationType, expireDateRaw, dateIndefinite, file);
        return toDto(aircraftDocumentationRepository.save(documentation));
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
                storedDocumentationPath = storeDocumentationFile(aircraft.getId(), documentationType, documentationFile);
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
            entity.setDocumentationName(storedDocumentationPath);
            entity.setExpireDate(expireDate);
            entity.setDateIndefinite(dateIndefinite);
            aircraftDocumentationRepository.save(entity);
        }
    }

    public void deleteById(Integer id) {
        AircraftDocumentation documentation = aircraftDocumentationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft documentation not found with id: " + id));
        deleteStoredFile(documentation.getDocumentationName());
        aircraftDocumentationRepository.delete(documentation);
    }

    public void deleteByAircraftId(Integer aircraftId) {
        List<AircraftDocumentation> docs = aircraftDocumentationRepository.findByAircraftId(aircraftId);
        for (AircraftDocumentation doc : docs) {
            deleteStoredFile(doc.getDocumentationName());
        }
        aircraftDocumentationRepository.deleteByAircraftId(aircraftId);
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
            String storedPath = storeDocumentationFile(documentation.getAircraft().getId(), documentationType, file);
            documentation.setDocumentationName(storedPath);
            deleteStoredFile(oldPath);
        }
    }

    private String storeDocumentationFile(Integer aircraftId, String documentationType, MultipartFile file) {
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
        return new AircraftDocumentationDTO(
                documentation.getId(),
                documentation.getAircraft().getId(),
                documentation.getDocumentationType(),
                documentation.getDocumentationName(),
                documentation.getExpireDate(),
                documentation.getDateIndefinite()
        );
    }
}
