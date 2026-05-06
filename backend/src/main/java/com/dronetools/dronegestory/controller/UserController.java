package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.UserCertificateUploadRequest;
import com.dronetools.dronegestory.dto.UserNameResponse;
import com.dronetools.dronegestory.dto.UserPasswordUpdateRequest;
import com.dronetools.dronegestory.dto.UserResponse;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.service.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.Collections;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<UserResponse> getAll() {
        return userService.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getById(@PathVariable Integer id) {
        if (!userService.canCurrentUserViewUser(id)) {
            throw new AccessDeniedException("You do not have permission to view this user.");
        }
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/names")
    @PreAuthorize("isAuthenticated()")
    public List<UserNameResponse> getAllNames() {
        return userService.findAllNames();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return userService.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @GetMapping("/self/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getOwnUserById(@PathVariable Integer id) {
        if (!userService.canCurrentUserModifyUser(id)) {
            throw new AccessDeniedException("You do not have permission to view this user as self.");
        }
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserResponse> createUserWithFile(
            @ModelAttribute User user,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "certificates", required = false) String certificatesJson,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        java.util.List<UserCertificateUploadRequest> certificates = Collections.emptyList();
        if (certificatesJson != null && !certificatesJson.isBlank()) {
            certificates = new ObjectMapper().readValue(
                    certificatesJson,
                    new TypeReference<java.util.List<UserCertificateUploadRequest>>() {}
            );
        }

        User createdUser = userService.createWithFileAndCertificates(user, imageFile, certificates, multipartRequest);
        return ResponseEntity.ok(toResponse(createdUser));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateUserWithFile(
            @PathVariable Integer id,
            @ModelAttribute User user,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "removeImage", required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request
    ) throws IOException {
        if (!userService.canCurrentUserModifyUser(id)) {
            throw new AccessDeniedException("You do not have permission to modify this user.");
        }
        boolean phoneNumberPresent = request.getParameterMap().containsKey("phoneNumber");
        boolean fechaNacPresent = request.getParameterMap().containsKey("fechaNac");
        User updatedUser = userService.updateWithFile(id, user, imageFile, phoneNumberPresent, fechaNacPresent, removeImage);

        return ResponseEntity.ok(toResponse(updatedUser));
    }

    @PutMapping(value = "/self/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateOwnUserWithFile(
            @PathVariable Integer id,
            @ModelAttribute User user,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "removeImage", required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request
    ) throws IOException {
        return updateUserWithFile(id, user, imageFile, removeImage, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updatePassword(
            @PathVariable Integer id,
            @RequestBody UserPasswordUpdateRequest request,
            Authentication authentication
    ) {
        try {
            if (request == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request body is required.");
            }
            userService.updatePassword(
                    id,
                    authentication != null ? authentication.getName() : null,
                    request.currentPassword(),
                    request.newPassword()
            );
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/images/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getUserImage(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String marker = "/api/users/images/";
        int markerIndex = requestUri.indexOf(marker);
        if (markerIndex < 0) {
            return ResponseEntity.badRequest().build();
        }

        String filename = requestUri.substring(markerIndex + marker.length());
        if (filename.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        if (!userService.canAccessUserScopedUpload(filename)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // Esto permite que si llega un string vacío, lo convierta a null en vez de fallar
        binder.registerCustomEditor(Integer.class, new org.springframework.beans.propertyeditors.CustomNumberEditor(Integer.class, true));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEffectiveRoles().stream().toList(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                userService.resolveUserImagePath(user),
                user.getDocIdentidad(),
                user.getFechaNac(),
                user.isState()
        );
    }
}
