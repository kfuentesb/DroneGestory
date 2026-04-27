package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DashboardBirthdayDTO {
    private final Integer userId;
    private final LocalDate birthDate;
    private final String firstName;
    private final String lastName;
    private final String username;
}
