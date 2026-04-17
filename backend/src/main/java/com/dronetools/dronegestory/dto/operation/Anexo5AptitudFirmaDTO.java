package com.dronetools.dronegestory.dto.operation;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class Anexo5AptitudFirmaDTO {
    private Long id;
    private Integer userId;
    private String nombreCompleto;
    private LocalDateTime fechaFirma;
    private boolean puedeEliminar;
}
