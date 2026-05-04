package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.AutomaticMailPreferenceRequest;
import com.dronetools.dronegestory.dto.AutomaticMailPreferenceResponse;
import com.dronetools.dronegestory.service.AutomaticMailPreferenceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/automatic-mail-preferences")
@RequiredArgsConstructor
public class AutomaticMailPreferenceController {

    private final AutomaticMailPreferenceService automaticMailPreferenceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<AutomaticMailPreferenceResponse> getAll() {
        return automaticMailPreferenceService.findAllForUsers();
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public AutomaticMailPreferenceResponse update(
            @PathVariable Integer userId,
            @Valid @RequestBody AutomaticMailPreferenceRequest request
    ) {
        return automaticMailPreferenceService.update(userId, request);
    }
}
