package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.SentMailRequest;
import com.dronetools.dronegestory.dto.SentMailResponse;
import com.dronetools.dronegestory.service.SentMailService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sent-mails")
@RequiredArgsConstructor
public class SentMailController {

    private final SentMailService sentMailService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<SentMailResponse> getAll() {
        return sentMailService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SentMailResponse> send(
            @Valid @RequestBody SentMailRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(sentMailService.sendAndStore(authentication.getName(), request));
    }
}
