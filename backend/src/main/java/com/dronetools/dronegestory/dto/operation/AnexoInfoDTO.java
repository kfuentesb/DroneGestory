package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Data;

@Data
public class AnexoInfoDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String color;

    public AnexoInfoDTO(Long id, int numeroVersion, AnexoStatus estado) {
        this.id = id;
        this.numeroVersion = numeroVersion;
        this.estado = estado;
        if (estado == null) {
            this.color = "GRIS";
        } else {
            this.color = estado == AnexoStatus.BORRADOR ? "AMARILLO" : "VERDE";
        }
    }

    public static AnexoInfoDTO empty() {
        return new AnexoInfoDTO(null, 0, null);
    }

    public static AnexoInfoDTO from(Anexo anexo) {
        if (anexo == null) return null;
        return new AnexoInfoDTO(anexo.getId(), anexo.getNumeroVersion(), anexo.getEstado());
    }
}
