package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DashboardCertificateExpiryDTO {
    private final LocalDate expireDate;
    private final String firstName;
    private final String lastName;
    private final String username;
    private final String certificateName;
    private final String certificateType;
}
