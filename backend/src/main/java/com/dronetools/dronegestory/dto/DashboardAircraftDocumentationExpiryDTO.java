package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DashboardAircraftDocumentationExpiryDTO {
    private final LocalDate expireDate;
    private final String documentationType;
    private final String serialNumber;
    private final String manufacturer;
    private final String model;
}
