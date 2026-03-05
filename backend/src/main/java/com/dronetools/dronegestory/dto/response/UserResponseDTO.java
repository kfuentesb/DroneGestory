package com.dronetools.dronegestory.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO {
    private Integer id;
    private Integer operatorId;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Integer phoneNumber;
    private String imagePath;
}