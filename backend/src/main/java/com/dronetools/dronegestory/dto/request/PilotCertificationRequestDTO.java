package com.dronetools.dronegestory.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PilotCertificationRequestDTO {
    private Integer pilotId;
    private Integer certificationId;
    private LocalDate startDate;
    private LocalDate endDate;
}