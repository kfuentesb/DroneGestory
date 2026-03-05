package com.dronetools.dronegestory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class OperationResponseDTO {
    private Integer id;
    private Integer pilotId;
    private Integer aircraftId;
    private LocalDate performedAt;
    private String status;
    private String category;
}