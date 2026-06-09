package com.dronetools.dronegestory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServerAttributesRequest(
        @NotNull @Min(1) @Max(1024) Integer maxFileSizeMb,
        @NotBlank @Email String mail,
        @NotBlank String smtpsKey
) {
}
