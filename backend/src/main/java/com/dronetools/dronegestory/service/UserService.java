package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.UserCertificateUploadRequest;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.dto.UserNameResponse;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserCertificateRepository userCertificateRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserCertificateRepository userCertificateRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.userCertificateRepository = userCertificateRepository;
        this.passwordEncoder = passwordEncoder;
    }
    // Simplificar codigo
//    public User getByUsername(String username) {
//        return userRepository.findByUsername(username)
//                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
//    }

    // Obtener todos los usuarios
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Obtener un usuario por id
    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username){
        return userRepository.findByUsername(username);
    }

    public List<UserNameResponse> findAllNames() {
        return userRepository.findAll().stream()
                .map(u -> new UserNameResponse(u.getId(), u.getFirstName(), u.getLastName()))
                .toList();
    }

    // Crear un nuevo usuario
    public User create(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    // Crear un nuevo usuario con archivo
    @Transactional
    public User createWithFile(User user, MultipartFile imageFile) throws IOException {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User savedUser = userRepository.save(user);

        Path userBaseDir = Paths.get("uploads", "users", savedUser.getId().toString()).toAbsolutePath().normalize();
        Path profileDir = userBaseDir.resolve("profile");

        if (imageFile != null && !imageFile.isEmpty()) {
            String originalName = imageFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "upload"
                    : Paths.get(originalName).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + safeName;
            Files.createDirectories(profileDir);
            Path target = profileDir.resolve(filename);
            imageFile.transferTo(target.toFile());
            savedUser.setImagePath(Paths.get("users", savedUser.getId().toString(), "profile", filename).toString().replace("\\", "/"));
        }

        return userRepository.save(savedUser);
    }

    @Transactional
    public User createWithFileAndCertificates(
            User user,
            MultipartFile imageFile,
            List<UserCertificateUploadRequest> certificates,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        User savedUser = createWithFile(user, imageFile);

        Path certificatesBaseDir = Paths.get("uploads", "users", savedUser.getId().toString(), "certificates")
                .toAbsolutePath()
                .normalize();

        for (UserCertificateUploadRequest certificateRequest : certificates) {
            if (certificateRequest == null) {
                continue;
            }

            String certificateType = resolveCertificateType(
                    certificateRequest.certificateType(),
                    certificateRequest.certificateLabel(),
                    certificateRequest.fileFieldKey()
            );
            String fileFieldKey = certificateRequest.fileFieldKey();
            Boolean dateIndefinite = certificateRequest.dateIndefinite();
            java.time.LocalDate expireDate = null;
            if (certificateRequest.expireDate() != null && !certificateRequest.expireDate().isBlank()) {
                expireDate = java.time.LocalDate.parse(certificateRequest.expireDate());
            }

            MultipartFile certificateFile = null;
            if (fileFieldKey != null && !fileFieldKey.isBlank()) {
                certificateFile = multipartRequest.getFile(fileFieldKey);
            }

            String storedCertificatePath = null;
            if (certificateFile != null && !certificateFile.isEmpty()) {
                String originalName = certificateFile.getOriginalFilename();
                String safeName = (originalName == null || originalName.isBlank())
                        ? "certificate"
                        : Paths.get(originalName).getFileName().toString();

                String safeTypeDir = (certificateType == null || certificateType.isBlank())
                        ? "unknown"
                        : certificateType.replaceAll("[^a-zA-Z0-9_-]", "_");

                Path certificateTypeDir = certificatesBaseDir.resolve(safeTypeDir);
                Files.createDirectories(certificateTypeDir);

                int dotIndex = safeName.lastIndexOf('.');
                String baseName = dotIndex > 0 ? safeName.substring(0, dotIndex) : safeName;
                String extension = dotIndex > 0 ? safeName.substring(dotIndex) : "";
                String sanitizedBaseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");

                String filename = savedUser.getId() + "-" + safeTypeDir + "-" + sanitizedBaseName + extension;
                Path target = certificateTypeDir.resolve(filename);
                certificateFile.transferTo(target.toFile());

                storedCertificatePath = Paths.get("users", savedUser.getId().toString(), "certificates", safeTypeDir, filename)
                        .toString()
                        .replace("\\", "/");
            }

            boolean emptyCertificate =
                    (storedCertificatePath == null || storedCertificatePath.isBlank()) &&
                    expireDate == null &&
                    dateIndefinite == null;

            if (emptyCertificate) {
                continue;
            }

            UserCertificate entity = new UserCertificate();
            entity.setUser(savedUser);
            entity.setCertificateType(certificateType);
            entity.setCertificateName(storedCertificatePath);
            entity.setExpireDate(expireDate);
            entity.setDateIndefinite(dateIndefinite);

            userCertificateRepository.save(entity);
        }

        return savedUser;
    }

    private String resolveCertificateType(String certificateType, String certificateLabel, String fileFieldKey) {
        if (certificateType != null && !certificateType.isBlank()) {
            return certificateType.trim();
        }

        if (certificateLabel != null && !certificateLabel.isBlank()) {
            return certificateLabel.trim();
        }

        if (fileFieldKey != null && !fileFieldKey.isBlank()) {
            return fileFieldKey.replaceFirst("^certificate_", "").trim();
        }

        return null;
    }

    // Actualizar un usuario existente
    public Optional<User> update(Integer id, User updatedUser) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setFirstName(updatedUser.getFirstName());
                    existingUser.setLastName(updatedUser.getLastName());
                    existingUser.setUsername(updatedUser.getUsername());
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                        existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }
                    existingUser.setEmail(updatedUser.getEmail());
                    existingUser.setType(updatedUser.getType());
                    existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
                    existingUser.setImagePath(updatedUser.getImagePath());
                    existingUser.setDocIdentidad(updatedUser.getDocIdentidad());
                    existingUser.setFechaNac(updatedUser.getFechaNac());
                    return userRepository.save(existingUser);
                });
    }

    public User updateWithFile(Integer id, User updatedUser, MultipartFile imageFile, boolean phoneNumberPresent, boolean removeImage) throws IOException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // 1. Actualización de campos básicos
        if (updatedUser.getFirstName() != null) user.setFirstName(updatedUser.getFirstName());
        if (updatedUser.getLastName() != null) user.setLastName(updatedUser.getLastName());
        if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
        if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
        if (updatedUser.getType() != null) user.setType(updatedUser.getType());
        
        if (updatedUser.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        } else if (phoneNumberPresent) {
            user.setPhoneNumber(null);
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getDocIdentidad() != null) user.setDocIdentidad(updatedUser.getDocIdentidad());
        if (updatedUser.getFechaNac() != null) {
            if (updatedUser.getFechaNac().isAfter(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("La fecha de nacimiento no puede ser en el futuro");
            }
            user.setFechaNac(updatedUser.getFechaNac());
        }
        if (updatedUser != null) {
            user.setState(updatedUser.isState());
        }


        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path profileDir = uploadDir.resolve(Paths.get("users", user.getId().toString(), "profile")).normalize();
        String oldImage = user.getImagePath();

        if (removeImage) {
            // CASO: El usuario pulsó la "X" en el frontend
            if (oldImage != null && !oldImage.isBlank()) {
                Path oldFile = uploadDir.resolve(oldImage).normalize();
                Files.deleteIfExists(oldFile);
            }
            user.setImagePath(null);
            
        } else if (imageFile != null && !imageFile.isEmpty()) {
            // CASO: El usuario subió un archivo nuevo (reemplazo)
            Files.createDirectories(profileDir);

            // Borrar la antigua antes de poner la nueva
            if (oldImage != null && !oldImage.isBlank()) {
                Path oldFile = uploadDir.resolve(oldImage).normalize();
                Files.deleteIfExists(oldFile);
            }

            String originalName = imageFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "upload"
                    : Paths.get(originalName).getFileName().toString();

            // Usamos el username para el nombre del archivo como tenías antes
            String filename = user.getUsername() + "_" + System.currentTimeMillis() + "_" + safeName;

            Path target = profileDir.resolve(filename);
            imageFile.transferTo(target.toFile());

            user.setImagePath(
                    Paths.get("users", user.getId().toString(), "profile", filename)
                            .toString()
                            .replace("\\", "/")
            );
        }

        return userRepository.save(user);
    }

    // Eliminar un usuario por id
    public void deleteById(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

}
