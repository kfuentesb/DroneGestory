package com.dronetools.dronegestory.dto;

public record ServerAttributesResponse(
        Integer maxFileSizeMb,
        String mail,
        String smtpsKey
) {
}
