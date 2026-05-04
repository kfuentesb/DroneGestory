package com.dronetools.dronegestory.dto;

public record AutomaticMailPreferenceResponse(
        Integer userId,
        boolean certificates,
        boolean operations,
        boolean maintenance,
        boolean events
) {
}
