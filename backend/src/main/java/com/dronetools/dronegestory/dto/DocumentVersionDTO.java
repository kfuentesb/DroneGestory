package com.dronetools.dronegestory.dto;

import java.time.LocalDateTime;

public record DocumentVersionDTO(
        Long id,
        Integer versionNumber,
        String fileUrl,
        String uploadNotes,
        LocalDateTime createdAt
) {
}
