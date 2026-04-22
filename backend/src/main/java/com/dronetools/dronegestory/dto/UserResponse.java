package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;
import java.time.LocalDate;


public record UserResponse(
        Integer id,
        java.util.List<UserType> roles,
        String firstName,
        String lastName,
        String username,
        String email,
        Integer phoneNumber,
        String imagePath,
        String docIdentidad,
        LocalDate fechaNac,
        Boolean state
) {
}
