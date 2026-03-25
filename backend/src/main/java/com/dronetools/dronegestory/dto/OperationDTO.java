package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.Operation;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    // Anexos
    private String a4;
    private String a5;
    private String a6;
    private String a7;
    private String a8;


    public OperationDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.nombreOperacion = op.getNombreOperacion();
        this.nombreCreador = op.getCreador().getFirstName()
                + " " + op.getCreador().getLastName();
        // Fechas formateadas
        this.fechaCreacion = op.getFechaCreacion();
        this.fechaActualizacion = op.getFechaActualizacion();
        this.estado = op.getEstado().name();

        // Anexos
        this.a4 = op.getAnexo4Actual() != null ? "v" + op.getAnexo4Actual().getNumeroVersion() : "-";
        this.a5 = op.getAnexo5Actual() != null ? "v" + op.getAnexo4Actual().getNumeroVersion() : "-";
        this.a6 = op.getAnexo6Actual() != null ? "v" + op.getAnexo4Actual().getNumeroVersion() : "-";
        this.a7 = op.getAnexo7Actual() != null ? "v" + op.getAnexo4Actual().getNumeroVersion() : "-";
        this.a8 = op.getAnexo8Actual() != null ? "v" + op.getAnexo4Actual().getNumeroVersion() : "-";
    }
}
