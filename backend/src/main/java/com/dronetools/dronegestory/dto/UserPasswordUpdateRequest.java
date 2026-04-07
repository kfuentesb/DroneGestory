package com.dronetools.dronegestory.dto;

public record UserPasswordUpdateRequest(
        String currentPassword,
        String newPassword
) {
}
