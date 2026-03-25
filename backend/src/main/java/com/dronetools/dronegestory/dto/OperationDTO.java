package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.Operation;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class OperationDTO {
    private Long idOperacion;
    private String nombreOperacion;
    private String nombreCreador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String estado;
    private Boolean a4;
    private Boolean a5;
    private Boolean a6;
    private Boolean a7;
    private Boolean a8;


    public OperationDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.nombreOperacion = op.getNombreOperacion();
        this.nombreCreador = op.getCreador().getFirstName()
                + " " + op.getCreador().getLastName();
        this.fechaCreacion = op.getFechaCreacion();
        this.fechaActualizacion = op.getFechaActualizacion();
        this.estado = op.getEstado().toString();

        // Anexos
        this.a4 = op.getAnexo4Actual() != null && op.getAnexo4Actual().getEstado().name().equals("FIRMADO");
        this.a5 = op.getAnexo5Actual() != null && op.getAnexo5Actual().getEstado().name().equals("FIRMADO");
        this.a6 = op.getAnexo6Actual() != null && op.getAnexo6Actual().getEstado().name().equals("FIRMADO");
        this.a7 = op.getAnexo7Actual() != null && op.getAnexo7Actual().getEstado().name().equals("FIRMADO");
        this.a8 = op.getAnexo8Actual() != null && op.getAnexo8Actual().getEstado().name().equals("FIRMADO");
    }
}
