package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.UserCertificateDTO;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserCertificateService {

    private final UserCertificateRepository userCertificateRepository;
    private final UserRepository userRepository;

    public UserCertificateService(UserCertificateRepository userCertificateRepository, UserRepository userRepository) {
        this.userCertificateRepository = userCertificateRepository;
        this.userRepository = userRepository;
    }

    public List<UserCertificateDTO> findAll() {
        return userCertificateRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<UserCertificateDTO> findById(Integer id) {
        return userCertificateRepository.findById(id).map(this::toDto);
    }

    public List<UserCertificateDTO> findByUserId(Integer userId) {
        return userCertificateRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    public UserCertificateDTO create(UserCertificateDTO dto) {
        User user = resolveUser(dto.userId());

        UserCertificate certificate = new UserCertificate();
        certificate.setUser(user);
        certificate.setCertificateType(dto.certificateType());
        certificate.setCertificateName(dto.certificateName());
        certificate.setExpireDate(dto.expireDate());
        certificate.setDateIndefinite(dto.dateIndefinite());

        return toDto(userCertificateRepository.save(certificate));
    }

    public Optional<UserCertificateDTO> update(Integer id, UserCertificateDTO dto) {
        return userCertificateRepository.findById(id).map(existing -> {
            User user = resolveUser(dto.userId());
            existing.setUser(user);
            existing.setCertificateType(dto.certificateType());
            existing.setCertificateName(dto.certificateName());
            existing.setExpireDate(dto.expireDate());
            existing.setDateIndefinite(dto.dateIndefinite());
            return toDto(userCertificateRepository.save(existing));
        });
    }

    public void deleteById(Integer id) {
        UserCertificate certificate = userCertificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User certificate not found with id: " + id));
        deleteStoredFile(certificate.getCertificateName());
        userCertificateRepository.delete(certificate);
    }

    public UserCertificateDTO createWithFile(
            Integer userId,
            String certificateType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        User user = resolveUser(userId);
        UserCertificate certificate = new UserCertificate();
        certificate.setUser(user);
        certificate.setCertificateType(certificateType);
        applyMetadataAndFile(certificate, certificateType, expireDateRaw, dateIndefinite, file);
        return toDto(userCertificateRepository.save(certificate));
    }

    public Optional<UserCertificateDTO> updateWithFile(
            Integer id,
            String certificateType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        return userCertificateRepository.findById(id).map(certificate -> {
            certificate.setCertificateType(certificateType);
            applyMetadataAndFile(certificate, certificateType, expireDateRaw, dateIndefinite, file);
            return toDto(userCertificateRepository.save(certificate));
        });
    }

    private User resolveUser(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    private void applyMetadataAndFile(
            UserCertificate certificate,
            String certificateType,
            String expireDateRaw,
            Boolean dateIndefinite,
            MultipartFile file
    ) {
        LocalDate expireDate = null;
        if (expireDateRaw != null && !expireDateRaw.isBlank()) {
            expireDate = LocalDate.parse(expireDateRaw);
        }

        boolean indefinite = Boolean.TRUE.equals(dateIndefinite);
        certificate.setDateIndefinite(dateIndefinite);
        certificate.setExpireDate(indefinite ? null : expireDate);

        if (file != null && !file.isEmpty()) {
            String oldPath = certificate.getCertificateName();
            String storedPath = storeCertificateFile(certificate.getUser().getId(), certificateType, file);
            certificate.setCertificateName(storedPath);
            if (oldPath != null && !oldPath.equals(storedPath)) {
                deleteStoredFile(oldPath);
            }
        }
    }

    private String storeCertificateFile(Integer userId, String certificateType, MultipartFile file) {
        try {
            String safeTypeDir = (certificateType == null || certificateType.isBlank())
                    ? "unknown"
                    : certificateType.replaceAll("[^a-zA-Z0-9_-]", "_");

            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path certificateTypeDir = uploadsDir.resolve(Paths.get("users", userId.toString(), "certificates", safeTypeDir)).normalize();
            Files.createDirectories(certificateTypeDir);

            String originalName = file.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "certificate"
                    : Paths.get(originalName).getFileName().toString();
            int dot = safeName.lastIndexOf('.');
            String extension = dot >= 0 ? safeName.substring(dot) : "";
            String filename = "user_" + userId + "_" + safeTypeDir + extension;

            Path target = certificateTypeDir.resolve(filename).normalize();
            file.transferTo(target.toFile());

            return Paths.get("users", userId.toString(), "certificates", safeTypeDir, filename)
                    .toString()
                    .replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Error storing certificate file", ex);
        }
    }

    private void deleteStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        try {
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path file = uploadsDir.resolve(relativePath).normalize();
            if (file.startsWith(uploadsDir)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting certificate file", ex);
        }
    }

    private UserCertificateDTO toDto(UserCertificate userCertificate) {
        return new UserCertificateDTO(
                userCertificate.getId(),
                userCertificate.getUser().getId(),
                userCertificate.getCertificateType(),
                userCertificate.getCertificateName(),
                userCertificate.getExpireDate(),
                userCertificate.getDateIndefinite()
        );
    }
}
