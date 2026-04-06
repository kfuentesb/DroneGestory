package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.UserCertificateDTO;
import com.dronetools.dronegestory.service.UserCertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/auth/user-certificates")
@RequiredArgsConstructor
public class UserCertificateController {

    private final UserCertificateService userCertificateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<UserCertificateDTO> getAll() {
        return userCertificateService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCertificateDTO> getById(@PathVariable Integer id) {
        return userCertificateService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public List<UserCertificateDTO> getByUserId(@PathVariable Integer userId) {
        return userCertificateService.findByUserId(userId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCertificateDTO> create(@RequestBody UserCertificateDTO dto) {
        return ResponseEntity.ok(userCertificateService.create(dto));
    }

    @PostMapping(value = "/user/{userId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCertificateDTO> createWithFile(
            @PathVariable Integer userId,
            @RequestParam("certificateType") String certificateType,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                userCertificateService.createWithFile(userId, certificateType, expireDate, dateIndefinite, file)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCertificateDTO> update(@PathVariable Integer id, @RequestBody UserCertificateDTO dto) {
        return userCertificateService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCertificateDTO> updateWithFile(
            @PathVariable Integer id,
            @RequestParam("certificateType") String certificateType,
            @RequestParam(value = "expireDate", required = false) String expireDate,
            @RequestParam(value = "dateIndefinite", required = false) Boolean dateIndefinite,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return userCertificateService.updateWithFile(id, certificateType, expireDate, dateIndefinite, file)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userCertificateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
