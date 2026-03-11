package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;

public record UserResponse(
        Integer id,
        UserType type,
        String firstName,
        String lastName,
        String username,
        String email,
        Integer phoneNumber,
        String imagePath
) {
}
