package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.common.AnexoVersionado;
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
        this.a4 = formatAnexoVersion(op.getAnexo4Actual());
        this.a5 = formatAnexoVersion(op.getAnexo5Actual());
        this.a6 = formatAnexoVersion(op.getAnexo6Actual());
        this.a7 = formatAnexoVersion(op.getAnexo7Actual());
        this.a8 = formatAnexoVersion(op.getAnexo8Actual());
    }

    // Helper
    private String formatAnexoVersion(AnexoVersionado anexo) {
        return anexo != null ? "v" + anexo.getNumeroVersion() : "-";
    }
}
