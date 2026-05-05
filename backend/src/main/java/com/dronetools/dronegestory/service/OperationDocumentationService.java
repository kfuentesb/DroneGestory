package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.DocumentVersionDTO;
import com.dronetools.dronegestory.dto.OperationDocumentationDTO;
import com.dronetools.dronegestory.model.DocumentVersion;
import com.dronetools.dronegestory.model.OperationDocumentation;
import com.dronetools.dronegestory.repository.OperationDocumentationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OperationDocumentationService {

    private final OperationDocumentationRepository operationDocumentationRepository;

    public OperationDocumentationService(OperationDocumentationRepository operationDocumentationRepository) {
        this.operationDocumentationRepository = operationDocumentationRepository;
    }

    @Transactional(readOnly = true)
    public List<OperationDocumentationDTO> findAll(boolean includeVersions) {
        return operationDocumentationRepository.findAllByOrderByNameAsc().stream()
                .map(documentation -> toDto(documentation, includeVersions))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<OperationDocumentationDTO> findById(Long id, boolean includeVersions) {
        return operationDocumentationRepository.findWithVersionsById(id)
                .map(documentation -> toDto(documentation, includeVersions));
    }

    public OperationDocumentationDTO create(String name, String notes, MultipartFile file, Integer version, Integer revision) {
        String cleanName = cleanName(name);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A file is required to create documentation.");
        }

        OperationDocumentation documentation = operationDocumentationRepository.save(new OperationDocumentation(cleanName));
        addVersion(documentation, notes, file, version, revision);
        return toDto(operationDocumentationRepository.save(documentation), true);
    }

    public OperationDocumentationDTO update(Long id, String name, String notes, Integer vNum, Integer rNum, MultipartFile file) {
        OperationDocumentation documentation = operationDocumentationRepository.findWithVersionsById(id)
                .orElseThrow(() -> new EntityNotFoundException("Not found: " + id));

        if (name != null && !name.isBlank()) {
            documentation.setName(cleanName(name));
        }
        
        if (file != null && !file.isEmpty()) {
            addVersion(documentation, notes, file, vNum, rNum);
        }

        return toDto(operationDocumentationRepository.save(documentation), true);
    }

    private void addVersion(OperationDocumentation documentation, String notes, MultipartFile file, Integer vNum, Integer rNum) {
        int finalV = (vNum != null) ? vNum : 
            documentation.getVersions().stream().mapToInt(DocumentVersion::getVersionNumber).max().orElse(0) + 1;
        
        int finalR = (rNum != null) ? rNum : 0;

        String storedPath = storeDocumentationFile(documentation.getId(), finalV, file);
        
        DocumentVersion newVersion = new DocumentVersion(documentation, finalV, storedPath, notes);
        newVersion.setRevisionNumber(finalR);
        
        documentation.getVersions().add(newVersion);
    }

    public void delete(Long id) {
        OperationDocumentation documentation = operationDocumentationRepository.findWithVersionsById(id)
                .orElseThrow(() -> new EntityNotFoundException("Operation documentation not found with id: " + id));

        documentation.getVersions().forEach(version -> deleteStoredFile(version.getFileUrl()));
        operationDocumentationRepository.delete(documentation);
    }

    private String storeDocumentationFile(Long documentationId, int versionNumber, MultipartFile file) {
        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path targetDir = uploadsDir.resolve(Paths.get(
                    "operation-documentation",
                    documentationId.toString(),
                    "v" + versionNumber
            )).normalize();
            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "documentation"
                    : Paths.get(originalName).getFileName().toString();
            int dot = safeName.lastIndexOf('.');
            String baseName = dot >= 0 ? safeName.substring(0, dot) : safeName;
            String extension = dot >= 0 ? safeName.substring(dot) : "";
            String filename = "operation_documentation_" + documentationId + "_v" + versionNumber + "_" +
                    baseName.replaceAll("[^a-zA-Z0-9_-]", "_") + extension;

            Path target = targetDir.resolve(filename).normalize();
            if (!target.startsWith(uploadsDir)) {
                throw new IllegalArgumentException("Invalid upload path.");
            }
            file.transferTo(target.toFile());

            return Paths.get(
                    "operation-documentation",
                    documentationId.toString(),
                    "v" + versionNumber,
                    filename
            ).toString().replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Error storing operation documentation", ex);
        }
    }

    private void deleteStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;

        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path filePath = uploadsDir.resolve(relativePath).normalize();
            
            if (filePath.startsWith(uploadsDir)) {
                Files.deleteIfExists(filePath);
                Files.deleteIfExists(filePath.getParent());
            }
        } catch (IOException ex) {
        }
    }

    private String cleanName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Documentation name is required.");
        }
        return name.trim();
    }

    private OperationDocumentationDTO toDto(OperationDocumentation documentation, boolean includeVersions) {
        List<DocumentVersionDTO> allVersions = documentation.getVersions().stream()
                .sorted(Comparator
                        .comparing(DocumentVersion::getVersionNumber, Comparator.nullsLast(Integer::compareTo))
                        .reversed()
                        .thenComparing(version -> {
                            LocalDateTime createdAt = version.getCreatedAt();
                            return createdAt == null ? LocalDateTime.MIN : createdAt;
                        }, Comparator.reverseOrder()))
                .map(this::toDto)
                .toList();
        DocumentVersionDTO latest = allVersions.isEmpty() ? null : allVersions.get(0);

        return new OperationDocumentationDTO(
                documentation.getId(),
                documentation.getName(),
                latest,
                includeVersions ? allVersions : List.of()
        );
    }

    public OperationDocumentationDTO deleteVersion(Long documentationId, Long versionId) {
        OperationDocumentation documentation = operationDocumentationRepository.findWithVersionsById(documentationId)
                .orElseThrow(() -> new EntityNotFoundException("Documentation not found"));

        DocumentVersion versionToDelete = documentation.getVersions().stream()
                .filter(v -> v.getId().equals(versionId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Version not found"));

        if (documentation.getVersions().size() <= 1) {
            throw new IllegalStateException("Cannot delete the only version.");
        }
        deleteStoredFile(versionToDelete.getFileUrl());
        versionToDelete.setDocumentation(null); 
        documentation.getVersions().remove(versionToDelete);
        return toDto(operationDocumentationRepository.save(documentation), true);
    }

    private DocumentVersionDTO toDto(DocumentVersion version) {
        return new DocumentVersionDTO(
                version.getId(),
                version.getVersionNumber(),
                version.getRevisionNumber(),
                version.getFileUrl(),
                version.getUploadNotes(),
                version.getCreatedAt()
        );
    }
}
