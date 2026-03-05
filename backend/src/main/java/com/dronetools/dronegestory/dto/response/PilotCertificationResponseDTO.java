package com.dronetools.dronegestory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PilotCertificationResponseDTO {
    private Integer pilotId;
    private Integer certificationId;
    private LocalDate startDate;
    private LocalDate endDate;
}