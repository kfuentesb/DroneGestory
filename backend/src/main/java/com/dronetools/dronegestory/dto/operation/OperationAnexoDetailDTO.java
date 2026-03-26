package com.dronetools.dronegestory.dto.operation;

import lombok.Data;

import java.util.List;

@Data
public class OperationAnexoDetailDTO {
    private int tipoAnexo;
    private AnexoInfoDTO actual;
    private List<AnexoHistoricoDTO> versiones;

    public OperationAnexoDetailDTO(int tipoAnexo, AnexoInfoDTO actual, List<AnexoHistoricoDTO> versiones) {
        this.tipoAnexo = tipoAnexo;
        this.actual = actual;
        this.versiones = versiones;
    }
}
