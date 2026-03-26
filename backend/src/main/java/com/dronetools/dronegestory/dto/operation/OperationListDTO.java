package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationListDTO {
    private Long idOperacion;
    private String nombreOperacion;
    private String nombreCreador;
    private LocalDateTime fechaCreacion;
    private OperationStatus estado;
    private boolean completada;

    // Resumen de anexos: solo versión + color (sin ID ni detalles)
    private String anexo4Version;   // "v2" o "-"
    private String anexo4Color;     // "AMARILLO", "VERDE" o "GRIS"
    private String anexo5Version;
    private String anexo5Color;
    private String anexo6Version;
    private String anexo6Color;
    private String anexo7Version;
    private String anexo7Color;
    private String anexo8Version;
    private String anexo8Color;

    // Alerta: ¿se puede completar?
    private boolean todosFirmadosPendiente;

    public OperationListDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.nombreOperacion = op.getNombreOperacion();
        this.nombreCreador = op.getCreador().getFirstName() + " " + op.getCreador().getLastName();
        this.fechaCreacion = op.getFechaCreacion();
        this.estado = op.getEstado();
        this.completada = op.getEstado() == OperationStatus.COMPLETADA;

        // Mapear anexos a strings simples
        this.anexo4Version = getVersionStr(op.getAnexo4Actual());
        this.anexo4Color = getColorStr(op.getAnexo4Actual());
        this.anexo5Version = getVersionStr(op.getAnexo5Actual());
        this.anexo5Color = getColorStr(op.getAnexo5Actual());
        this.anexo6Version = getVersionStr(op.getAnexo6Actual());
        this.anexo6Color = getColorStr(op.getAnexo6Actual());
        this.anexo7Version = getVersionStr(op.getAnexo7Actual());
        this.anexo7Color = getColorStr(op.getAnexo7Actual());
        this.anexo8Version = getVersionStr(op.getAnexo8Actual());
        this.anexo8Color = getColorStr(op.getAnexo8Actual());

        // Alerta: todos firmados pero operación no completada
        this.todosFirmadosPendiente = op.todosAnexosFirmados() && !completada;
    }

    private String getVersionStr(com.dronetools.dronegestory.common.AnexoVersionado anexo) {
        return anexo != null ? "v" + anexo.getNumeroVersion() : "-";
    }

    private String getColorStr(com.dronetools.dronegestory.common.AnexoVersionado anexo) {
        if (anexo == null) return "GRIS";
        return anexo.getEstado().name().equals("BORRADOR") ? "AMARILLO" : "VERDE";
    }
}
