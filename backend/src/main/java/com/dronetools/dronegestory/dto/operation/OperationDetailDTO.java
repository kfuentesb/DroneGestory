package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationDetailDTO {
    private Long idOperacion;
    private String nombreOperacion;
    private String nombreCreador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private OperationStatus estadoOperacion;
    private boolean completada;

    // Anexos actuales (última versión de cada uno)
    private AnexoInfoDTO anexo4;
    private AnexoInfoDTO anexo5;
    private AnexoInfoDTO anexo6;
    private AnexoInfoDTO anexo7;
    private AnexoInfoDTO anexo8;

    // Indicador para alerta "todos firmados, ¿completar?"
    private boolean todosAnexosFirmados;

    public OperationDetailDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.nombreOperacion = op.getNombreOperacion();
        this.nombreCreador = op.getCreador().getFirstName() + " " + op.getCreador().getLastName();
        this.fechaCreacion = op.getFechaCreacion();
        this.fechaActualizacion = op.getFechaActualizacion();
        this.estadoOperacion = op.getEstado();
        this.completada = op.getEstado() == OperationStatus.COMPLETADA;

        // Mapear anexos actuales
        this.anexo4 = mapAnexo(op.getAnexo4Actual());
        this.anexo5 = mapAnexo(op.getAnexo5Actual());
        this.anexo6 = mapAnexo(op.getAnexo6Actual());
        this.anexo7 = mapAnexo(op.getAnexo7Actual());
        this.anexo8 = mapAnexo(op.getAnexo8Actual());

        this.todosAnexosFirmados = op.todosAnexosFirmados();
    }

    private AnexoInfoDTO mapAnexo(com.dronetools.dronegestory.common.AnexoVersionado anexo) {
        if (anexo == null) return AnexoInfoDTO.empty();
        return new AnexoInfoDTO(
                ((com.dronetools.dronegestory.model.Anexo) anexo).getId(),
                anexo.getNumeroVersion(),
                anexo.getEstado()
        );
    }
}