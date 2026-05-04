package com.dronetools.dronegestory.dto;

import jakarta.validation.constraints.NotNull;

public record AutomaticMailPreferenceRequest(
        @NotNull Boolean certificates,
        @NotNull Boolean operations,
        @NotNull Boolean maintenance,
        @NotNull Boolean events
) {
}
