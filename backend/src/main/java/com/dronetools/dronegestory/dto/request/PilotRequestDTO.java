package com.dronetools.dronegestory.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PilotRequestDTO {
    private Integer operatorId;
    private String firstName;
    private String lastName;
    private String username;
    private String password;
    private String email;
    private Integer phoneNumber;
    private String imagePath;
    // si agregas campos propios de Pilot, van aquí
}