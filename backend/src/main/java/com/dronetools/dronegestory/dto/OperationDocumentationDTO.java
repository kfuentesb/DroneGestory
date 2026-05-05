package com.dronetools.dronegestory.dto;

import java.util.List;

public record OperationDocumentationDTO(
        Long id,
        String name,
        DocumentVersionDTO latestVersion,
        List<DocumentVersionDTO> versions
) {
}
