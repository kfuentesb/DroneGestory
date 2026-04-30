package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SentMailRequest(
        @NotBlank @Size(max = 180) String header,
        @NotBlank String text,
        @NotBlank String recipientMode,
        List<Integer> userIds,
        List<UserType> roles
) {
}
