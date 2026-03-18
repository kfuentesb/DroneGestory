package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.UserResponse;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.findAll().stream().map(this::toResponse).toList();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #id == authentication.principal.id")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Integer id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName(); // comes from JWT
        return userService.findByUsername(username)
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> createUserWithFile(
            @ModelAttribute User user,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        User createdUser = userService.createWithFile(user, imageFile);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> updateUserWithFile(
            @PathVariable Integer id,
            @ModelAttribute User user,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            HttpServletRequest request
    ) throws IOException {

        boolean phoneNumberPresent = request.getParameterMap().containsKey("phoneNumber");
        User updatedUser = userService.updateWithFile(id, user, imageFile, phoneNumberPresent);

        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/images/{filename:.+}")// el ":.+" hace que ignore si tiene puntos en la base de datos, y lo tiene
    public ResponseEntity<Resource> getUserImage(@PathVariable String filename) throws IOException {
        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
        Path file = uploadsDir.resolve(filename).normalize();

        if (!file.startsWith(uploadsDir)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Detect content type
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getType(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getImagePath()
        );
    }
}
