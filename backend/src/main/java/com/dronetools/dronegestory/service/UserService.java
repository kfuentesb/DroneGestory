package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.UserCertificateUploadRequest;
import com.dronetools.dronegestory.exception.ConflictException;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.dto.UserNameResponse;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.UserType;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.regex.Pattern;
import java.util.Set;
import java.util.regex.Matcher;

@Service
public class UserService {
    private static final Pattern PASSWORD_POLICY = Pattern.compile("^(?=.*\\d).{8,}$");
    private static final Pattern USER_UPLOAD_PATH_PATTERN = Pattern.compile("^users/(\\d+)(?:/.*)?$");
    private static final Pattern USER_PROFILE_UPLOAD_PATH_PATTERN = Pattern.compile("^users/(\\d+)/profile(?:/.*)?$");

    private final UserRepository userRepository;
    private final UserCertificateRepository userCertificateRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserCertificateRepository userCertificateRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.userCertificateRepository = userCertificateRepository;
        this.passwordEncoder = passwordEncoder;
    }

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

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("User not authenticated.");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Authenticated user not found."));
    }

    public boolean canAccessUserScopedUpload(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return false;
        }

        User currentUser = getAuthenticatedUser();
        if (USER_PROFILE_UPLOAD_PATH_PATTERN.matcher(relativePath).matches()) {
            return true;
        }

        Matcher matcher = USER_UPLOAD_PATH_PATTERN.matcher(relativePath);
        if (!matcher.matches()) {
            return false;
        }
        if (isPrivileged(currentUser)) {
            return true;
        }

        Integer targetUserId = Integer.valueOf(matcher.group(1));
        return targetUserId.equals(currentUser.getId());
    }

    public boolean canCurrentUserViewUser(Integer targetUserId) {
        if (targetUserId == null) {
            return false;
        }
        getAuthenticatedUser();
        return true;
    }

    public boolean canCurrentUserModifyUser(Integer targetUserId) {
        if (targetUserId == null) {
            return false;
        }
        User currentUser = getAuthenticatedUser();
        return isPrivileged(currentUser) || targetUserId.equals(currentUser.getId());
    }

    private void ensureUniqueUsername(User user) {
        if (user == null || user.getUsername() == null || user.getUsername().isBlank()) {
            return;
        }
        String username = user.getUsername().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("El nombre de usuario ya existe.");
        }
        user.setUsername(username);
    }

    public List<UserNameResponse> findAllNames() {
        return userRepository.findAll().stream()
                .map(u -> new UserNameResponse(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEffectiveRoles().stream().toList()
                ))
                .toList();
    }

    // Crear un nuevo usuario
    public User create(User user) {
        ensureUniqueUsername(user);
        applyRoles(user, user.getRoles(), true);
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    // Crear un nuevo usuario con archivo
    @Transactional
    public User createWithFile(User user, MultipartFile imageFile) throws IOException {
        ensureUniqueUsername(user);
        applyRoles(user, user.getRoles(), true);
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
                    if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
                        String newUsername = updatedUser.getUsername().trim();
                        if (!newUsername.equalsIgnoreCase(existingUser.getUsername()) &&
                                userRepository.existsByUsernameIgnoreCase(newUsername)) {
                            throw new ConflictException("El nombre de usuario ya existe.");
                        }
                        existingUser.setUsername(newUsername);
                    }
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                        existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }
                    existingUser.setEmail(updatedUser.getEmail());
                    applyRoles(existingUser, updatedUser.getRoles(), false);
                    existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
                    existingUser.setImagePath(updatedUser.getImagePath());
                    existingUser.setDocIdentidad(updatedUser.getDocIdentidad());
                    existingUser.setFechaNac(updatedUser.getFechaNac());
                    return userRepository.save(existingUser);
                });
    }

    @Transactional
    public User updateWithFile(
            Integer id,
            User updatedUser,
            MultipartFile imageFile,
            boolean phoneNumberPresent,
            boolean fechaNacPresent,
            boolean removeImage
    ) throws IOException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // --- LÓGICA DE SEGURIDAD PARA CAMPOS SENSIBLES ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdminOrManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));

        // Campos básicos (Permitidos para el propio usuario y administradores)
        if (updatedUser.getFirstName() != null) user.setFirstName(updatedUser.getFirstName());
        if (updatedUser.getLastName() != null) user.setLastName(updatedUser.getLastName());
        if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
        
        if (updatedUser.getDocIdentidad() != null) user.setDocIdentidad(updatedUser.getDocIdentidad());
        if (updatedUser.getFechaNac() != null) {
            if (updatedUser.getFechaNac().isAfter(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("La fecha de nacimiento no puede ser en el futuro");
            }
            user.setFechaNac(updatedUser.getFechaNac());
        } else if (fechaNacPresent) {
            user.setFechaNac(null);
        }

        if (updatedUser.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        } else if (phoneNumberPresent) {
            user.setPhoneNumber(null);
        }

        // PROTECCIÓN DE CAMPOS SENSIBLES (Solo Admin/Manager)
        if (isAdminOrManager) {
            // Solo el jefe puede cambiar el nombre de usuario, el rol o si la cuenta está activa
            if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
                String newUsername = updatedUser.getUsername().trim();
                if (!newUsername.equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsernameIgnoreCase(newUsername)) {
                    throw new ConflictException("El nombre de usuario ya existe.");
                }
                user.setUsername(newUsername);
            }
            if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
                applyRoles(user, updatedUser.getRoles(), false);
            }
            user.setState(updatedUser.isState());
        } else {
            // Si no es admin, ignoramos silenciosamente los cambios en username, type y state.
            // El objeto 'user' mantiene los valores que ya tenía en la base de datos.
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank() && isAdminOrManager) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // --- GESTIÓN DE IMAGEN (Tu lógica actual se mantiene igual) ---
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path profileDir = uploadDir.resolve(Paths.get("users", user.getId().toString(), "profile")).normalize();
        String oldImage = user.getImagePath();

        if (removeImage) {
            if (oldImage != null && !oldImage.isBlank()) {
                Path oldFile = uploadDir.resolve(oldImage).normalize();
                Files.deleteIfExists(oldFile);
            }
            user.setImagePath(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            Files.createDirectories(profileDir);
            if (oldImage != null && !oldImage.isBlank()) {
                Path oldFile = uploadDir.resolve(oldImage).normalize();
                Files.deleteIfExists(oldFile);
            }
            String originalName = imageFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank()) ? "upload" : Paths.get(originalName).getFileName().toString();
            
            // Usamos el username real de la base de datos para el nombre del archivo
            String filename = user.getUsername() + "_" + System.currentTimeMillis() + "_" + safeName;
            Path target = profileDir.resolve(filename);
            imageFile.transferTo(target.toFile());

            user.setImagePath(Paths.get("users", user.getId().toString(), "profile", filename).toString().replace("\\", "/"));
        }

        return userRepository.save(user);
    }

    private void applyRoles(User user, Set<UserType> requestedRoles, boolean failIfEmpty) {
        LinkedHashSet<UserType> normalizedRoles = new LinkedHashSet<>();
        if (requestedRoles != null) {
            requestedRoles.stream()
                    .filter(role -> role != null)
                    .forEach(normalizedRoles::add);
        }

        if (normalizedRoles.isEmpty() && failIfEmpty) {
            throw new IllegalArgumentException("At least one role is required.");
        }

        if (!normalizedRoles.isEmpty()) {
            user.setRoles(normalizedRoles);
        }
    }
    @Transactional
    public void updatePassword(Integer id, String actorUsername, String actorPassword, String newPassword) {
        if (actorUsername == null || actorUsername.isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        if (actorPassword == null || actorPassword.isBlank()) {
            throw new IllegalArgumentException("Current session password is required.");
        }
        if (newPassword == null || !PASSWORD_POLICY.matcher(newPassword).matches()) {
            throw new IllegalArgumentException("Password must be at least 8 characters and include at least 1 number.");
        }

        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
        if (!passwordEncoder.matches(actorPassword, actor.getPassword())) {
            throw new IllegalArgumentException("Current session password is invalid.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Eliminar un usuario por id
    @Transactional
    public void deleteById(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userCertificateRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }

    private boolean isPrivileged(User user) {
        return user.getEffectiveRoles().contains(UserType.ADMIN)
                || user.getEffectiveRoles().contains(UserType.MANAGER);
    }

}
