package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMaintenanceDateDTO {
    private Long aircraftId;
    private LocalDate maintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String description;
    private String serialNumber;
    private String manufacturer;
    private String model;
}