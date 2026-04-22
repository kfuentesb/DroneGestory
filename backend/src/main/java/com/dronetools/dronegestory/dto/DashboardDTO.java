package com.dronetools.dronegestory.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
public class DashboardDTO {
    private long totalOperaciones;
    private long totalPilotos;
    private long totalUsuarios;
    private long totalDrones;
    private List<DashboardCertificateExpiryDTO> certificateExpirations = new ArrayList<>();
    private List<DashboardAircraftDocumentationExpiryDTO> aircraftDocumentationExpirations = new ArrayList<>();
    private List<DashboardBirthdayDTO> birthdays = new ArrayList<>();
}
