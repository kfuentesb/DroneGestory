package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.model.AircraftModelDocumentation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftModelRepository;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.util.UploadPathUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FileActionService {
    private final UserRepository userRepository;
    private final UserCertificateRepository certificateRepository;
    private final AircraftRepository aircraftRepository;
    private final AircraftModelRepository aircraftModelRepository;
    private final AircraftDocumentationRepository aircraftDocumentationRepository;
    private final AircraftModelDocumentationRepository aircraftModelDocumentationRepository;
    private final Anexo4Repository anexo4Repository;

    @Transactional
    public void deleteFileAndSyncDb(String relativePath) throws IOException {
        String cleanPath = clean(relativePath);
        if (!deleteDatabaseReference(cleanPath)) {
            throw new IllegalArgumentException("No database-backed file found for path: " + cleanPath);
        }
        UploadPathUtils.deleteFileAndPruneEmptyParents(cleanPath);
    }

    @Transactional
    public String replaceFileAndSyncDb(String relativePath, MultipartFile file) throws IOException {
        String cleanPath = clean(relativePath);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A replacement file is required.");
        }

        String newPath = replaceDatabaseReference(cleanPath, file);
        if (newPath == null) {
            throw new IllegalArgumentException("No database-backed file found for path: " + cleanPath);
        }
        if (!Objects.equals(cleanPath, newPath)) {
            UploadPathUtils.deleteFileAndPruneEmptyParents(cleanPath);
        }
        return newPath;
    }

    private boolean deleteDatabaseReference(String cleanPath) {
        for (User user : userRepository.findAll()) {
            if (matches(cleanPath, user.getImagePath(), userProfilePath(user))) {
                user.setImagePath(null);
                userRepository.save(user);
                return true;
            }
        }

        for (UserCertificate certificate : certificateRepository.findAll()) {
            if (matches(cleanPath, certificate.getCertificateName(), userCertificatePath(certificate))) {
                certificateRepository.delete(certificate);
                return true;
            }
        }

        for (Aircraft aircraft : aircraftRepository.findAll()) {
            if (matches(cleanPath, aircraft.getImagePath(), aircraftProfilePath(aircraft))) {
                aircraft.setImagePath(null);
                aircraftRepository.save(aircraft);
                return true;
            }
        }

        for (AircraftDocumentation documentation : aircraftDocumentationRepository.findAll()) {
            if (matches(cleanPath, documentation.getDocumentationName(), aircraftDocumentationPath(documentation))) {
                aircraftDocumentationRepository.delete(documentation);
                return true;
            }
        }

        for (AircraftModel model : aircraftModelRepository.findAll()) {
            if (matches(cleanPath, model.getImagePath(), aircraftModelProfilePath(model))) {
                model.setImagePath(null);
                aircraftModelRepository.save(model);
                return true;
            }
        }

        for (AircraftModelDocumentation documentation : aircraftModelDocumentationRepository.findAll()) {
            if (matches(cleanPath, documentation.getDocumentationName(), aircraftModelDocumentationPath(documentation))) {
                aircraftDocumentationRepository.findByModelDocumentation_Id(documentation.getId()).forEach(aircraftDoc -> {
                    aircraftDoc.setModelDocumentation(null);
                    aircraftDocumentationRepository.save(aircraftDoc);
                });
                aircraftModelDocumentationRepository.delete(documentation);
                return true;
            }
        }

        for (Anexo4 anexo4 : anexo4Repository.findAll()) {
            if (matches(cleanPath, anexo4.getImagenEspacioAereo(), operationAnexo4Path(anexo4, anexo4.getImagenEspacioAereo()))) {
                anexo4.setImagenEspacioAereo(null);
                anexo4Repository.save(anexo4);
                return true;
            }
            if (matches(cleanPath, anexo4.getImagenZonaVuelo(), operationAnexo4Path(anexo4, anexo4.getImagenZonaVuelo()))) {
                anexo4.setImagenZonaVuelo(null);
                anexo4Repository.save(anexo4);
                return true;
            }
        }

        return false;
    }

    private String replaceDatabaseReference(String cleanPath, MultipartFile file) throws IOException {
        for (User user : userRepository.findAll()) {
            if (matches(cleanPath, user.getImagePath(), userProfilePath(user))) {
                String newPath = store(file, Paths.get("users", UploadPathUtils.entityFolder(user.getId(), user.getUsername()), "profile"));
                user.setImagePath(newPath);
                userRepository.save(user);
                return newPath;
            }
        }

        for (UserCertificate certificate : certificateRepository.findAll()) {
            if (matches(cleanPath, certificate.getCertificateName(), userCertificatePath(certificate))) {
                String newPath = store(file, Paths.get("users", UploadPathUtils.entityFolder(certificate.getUser().getId(), certificate.getUser().getUsername()), "certificates", UploadPathUtils.safeSegment(certificate.getCertificateType())));
                certificate.setCertificateName(newPath);
                certificateRepository.save(certificate);
                return newPath;
            }
        }

        for (Aircraft aircraft : aircraftRepository.findAll()) {
            if (matches(cleanPath, aircraft.getImagePath(), aircraftProfilePath(aircraft))) {
                String newPath = store(file, Paths.get("aircraft", aircraftFolder(aircraft), "profile"));
                aircraft.setImagePath(newPath);
                aircraftRepository.save(aircraft);
                return newPath;
            }
        }

        for (AircraftDocumentation documentation : aircraftDocumentationRepository.findAll()) {
            if (matches(cleanPath, documentation.getDocumentationName(), aircraftDocumentationPath(documentation))) {
                String newPath = store(file, Paths.get("aircraft", aircraftFolder(documentation.getAircraft()), "documentation", UploadPathUtils.safeSegment(documentation.getDocumentationType())));
                documentation.setDocumentationName(newPath);
                aircraftDocumentationRepository.save(documentation);
                return newPath;
            }
        }

        for (AircraftModel model : aircraftModelRepository.findAll()) {
            if (matches(cleanPath, model.getImagePath(), aircraftModelProfilePath(model))) {
                String newPath = store(file, Paths.get("aircraft-model", aircraftModelFolder(model), "profile"));
                model.setImagePath(newPath);
                aircraftModelRepository.save(model);
                return newPath;
            }
        }

        for (AircraftModelDocumentation documentation : aircraftModelDocumentationRepository.findAll()) {
            if (matches(cleanPath, documentation.getDocumentationName(), aircraftModelDocumentationPath(documentation))) {
                String newPath = store(file, Paths.get("aircraft-model", aircraftModelFolder(documentation.getAircraftModel()), "documentation", UploadPathUtils.safeSegment(documentation.getDocumentationType())));
                documentation.setDocumentationName(newPath);
                aircraftModelDocumentationRepository.save(documentation);
                return newPath;
            }
        }

        for (Anexo4 anexo4 : anexo4Repository.findAll()) {
            if (matches(cleanPath, anexo4.getImagenEspacioAereo(), operationAnexo4Path(anexo4, anexo4.getImagenEspacioAereo()))) {
                String newPath = store(file, Paths.get("operations", UploadPathUtils.operationFolder(anexo4.getOperation().getCodigo()), "anexo4"));
                anexo4.setImagenEspacioAereo(newPath);
                anexo4Repository.save(anexo4);
                return newPath;
            }
            if (matches(cleanPath, anexo4.getImagenZonaVuelo(), operationAnexo4Path(anexo4, anexo4.getImagenZonaVuelo()))) {
                String newPath = store(file, Paths.get("operations", UploadPathUtils.operationFolder(anexo4.getOperation().getCodigo()), "anexo4"));
                anexo4.setImagenZonaVuelo(newPath);
                anexo4Repository.save(anexo4);
                return newPath;
            }
        }

        return null;
    }

    private String store(MultipartFile file, Path relativeDir) throws IOException {
        Path uploadsRoot = UploadPathUtils.uploadsRoot();
        Path targetDir = uploadsRoot.resolve(relativeDir).normalize();
        if (!targetDir.startsWith(uploadsRoot)) {
            throw new IllegalArgumentException("Invalid upload path.");
        }
        Files.createDirectories(targetDir);
        String originalName = file.getOriginalFilename();
        String safeName = originalName == null || originalName.isBlank()
                ? "upload"
                : Paths.get(originalName).getFileName().toString();
        int dot = safeName.lastIndexOf('.');
        String base = dot >= 0 ? safeName.substring(0, dot) : safeName;
        String extension = dot >= 0 ? safeName.substring(dot) : "";
        String filename = System.currentTimeMillis() + "_" + UploadPathUtils.safeSegment(base) + extension;
        Path target = targetDir.resolve(filename).normalize();
        if (!target.startsWith(uploadsRoot)) {
            throw new IllegalArgumentException("Invalid upload path.");
        }
        file.transferTo(target.toFile());
        return uploadsRoot.relativize(target).toString().replace("\\", "/");
    }

    private boolean matches(String cleanPath, String storedValue, String resolvedPath) {
        if (storedValue == null || storedValue.isBlank()) {
            return false;
        }
        String normalizedStored = clean(storedValue);
        return cleanPath.equals(normalizedStored) || cleanPath.equals(clean(resolvedPath));
    }

    private String userProfilePath(User user) {
        return UploadPathUtils.userProfilePath(user.getId(), user.getImagePath());
    }

    private String userCertificatePath(UserCertificate certificate) {
        return UploadPathUtils.userCertificatePath(certificate.getUser().getId(), certificate.getCertificateType(), certificate.getCertificateName());
    }

    private String aircraftProfilePath(Aircraft aircraft) {
        return aircraft.getImagePath();
    }

    private String aircraftDocumentationPath(AircraftDocumentation documentation) {
        String storedValue = documentation.getDocumentationName();
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }
        String normalized = clean(storedValue);
        if (normalized.contains("/")) {
            return normalized;
        }
        return Paths.get(
                        "aircraft",
                        aircraftFolder(documentation.getAircraft()),
                        "documentation",
                        UploadPathUtils.safeSegment(documentation.getDocumentationType()),
                        normalized
                )
                .toString()
                .replace("\\", "/");
    }

    private String aircraftModelProfilePath(AircraftModel model) {
        return model.getImagePath();
    }

    private String aircraftModelDocumentationPath(AircraftModelDocumentation documentation) {
        String storedValue = documentation.getDocumentationName();
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }
        String normalized = clean(storedValue);
        if (normalized.contains("/")) {
            return normalized;
        }
        return Paths.get(
                        "aircraft-model",
                        aircraftModelFolder(documentation.getAircraftModel()),
                        "documentation",
                        UploadPathUtils.safeSegment(documentation.getDocumentationType()),
                        normalized
                )
                .toString()
                .replace("\\", "/");
    }

    private String operationAnexo4Path(Anexo4 anexo4, String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }
        String normalized = clean(storedValue);
        if (normalized.contains("/")) {
            return normalized;
        }
        String newPath = Paths.get("operations", UploadPathUtils.operationFolder(anexo4.getOperation().getCodigo()), "anexo4", normalized)
                .toString()
                .replace("\\", "/");
        if (Files.exists(UploadPathUtils.uploadsRoot().resolve(newPath).normalize())) {
            return newPath;
        }
        return Paths.get("operations", anexo4.getOperation().getIdOperacion().toString(), "anexo4", normalized)
                .toString()
                .replace("\\", "/");
    }

    private String aircraftFolder(Aircraft aircraft) {
        String modelName = aircraft.getAircraftModel() == null ? null : aircraft.getAircraftModel().getModel();
        return UploadPathUtils.aircraftFolder(aircraft.getSerialNumber(), modelName);
    }

    private String aircraftModelFolder(AircraftModel model) {
        return UploadPathUtils.aircraftModelFolder(model.getManufacturer(), model.getModel());
    }

    private String clean(String path) {
        if (path == null) {
            return "";
        }
        return path.replace("\\", "/").replaceFirst("^/+", "");
    }
}
