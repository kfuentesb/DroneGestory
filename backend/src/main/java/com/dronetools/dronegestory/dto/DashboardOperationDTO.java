package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DashboardOperationDTO {
    private final Long operationId;
    private final String codigo;
    private final LocalDateTime fechaPrevista;
}
