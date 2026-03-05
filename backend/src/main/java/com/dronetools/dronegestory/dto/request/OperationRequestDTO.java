package com.dronetools.dronegestory.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class OperationRequestDTO {
    private Integer pilotId;
    private Integer aircraftId;
    private LocalDate performedAt;
    private String status;
    private String category;
}