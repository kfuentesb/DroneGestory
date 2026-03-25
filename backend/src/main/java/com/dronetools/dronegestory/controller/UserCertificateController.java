package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.UserCertificateDTO;
import com.dronetools.dronegestory.service.UserCertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserCertificateDTO> getById(@PathVariable Integer id) {
        return userCertificateService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<UserCertificateDTO> getByUserId(@PathVariable Integer userId) {
        return userCertificateService.findByUserId(userId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserCertificateDTO> create(@RequestBody UserCertificateDTO dto) {
        return ResponseEntity.ok(userCertificateService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserCertificateDTO> update(@PathVariable Integer id, @RequestBody UserCertificateDTO dto) {
        return userCertificateService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userCertificateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
