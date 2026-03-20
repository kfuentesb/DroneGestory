package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.UserNameResponse;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
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
    public User createWithFile(User user, MultipartFile imageFile) throws IOException {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String originalName = imageFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "upload"
                    : Paths.get(originalName).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + safeName;
            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            imageFile.transferTo(target.toFile());
            user.setImagePath(filename);
        }

        return userRepository.save(user);
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
                    return userRepository.save(existingUser);
                });
    }

    // public User updateWithFile(Integer id, User updatedUser, MultipartFile imageFile, boolean phoneNumberPresent) throws IOException {

    //     User user = userRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

    //     if (updatedUser.getFirstName() != null) user.setFirstName(updatedUser.getFirstName());
    //     if (updatedUser.getLastName() != null) user.setLastName(updatedUser.getLastName());
    //     if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
    //     if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
    //     if (updatedUser.getType() != null) user.setType(updatedUser.getType());
    //     if (updatedUser.getPhoneNumber() != null) {
    //         user.setPhoneNumber(updatedUser.getPhoneNumber());
    //     } else if (phoneNumberPresent) {
    //         user.setPhoneNumber(null);
    //     }

    //     if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
    //         user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
    //     }

    //     // Handle image upload
    //     if (imageFile != null && !imageFile.isEmpty()) {

    //         Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
    //         Files.createDirectories(uploadDir);

    //         String oldImage = user.getImagePath();

    //         String originalName = imageFile.getOriginalFilename();
    //         String safeName = (originalName == null || originalName.isBlank())
    //                 ? "upload"
    //                 : Paths.get(originalName).getFileName().toString();

    //         // String filename = System.currentTimeMillis() + "_" + safeName;
    //         String filename = updatedUser.getUsername() + "_" + safeName;

    //         Path target = uploadDir.resolve(filename);
    //         imageFile.transferTo(target.toFile());

    //         user.setImagePath(filename);

    //         // Delete old image if it exists
    //         if (oldImage != null && !oldImage.isBlank()) {
    //             Path oldFile = uploadDir.resolve(oldImage).normalize();
    //             Files.deleteIfExists(oldFile);
    //         }
    //     }

    //     return userRepository.save(user);
    // }

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

        // 2. Gestión de Imagen (Borrar o Reemplazar)
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
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
            Files.createDirectories(uploadDir);

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

            Path target = uploadDir.resolve(filename);
            imageFile.transferTo(target.toFile());

            user.setImagePath(filename);
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
