package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;

import java.util.List;

public record UserSummaryResponse(
        Integer id,
        List<UserType> roles,
        String firstName,
        String lastName,
        String username,
        String email,
        Integer phoneNumber
) {
}
