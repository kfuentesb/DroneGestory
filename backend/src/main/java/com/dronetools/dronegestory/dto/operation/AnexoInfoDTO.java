package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Data;

@Data
public class AnexoInfoDTO {
    private Long id;              // ID del anexo (para firmar/ver)
    private int numeroVersion;    // v1, v2, etc.
    private AnexoStatus estado;   // BORRADOR o FIRMADO
    private String color;         // "AMARILLO" o "VERDE" (para frontend)

    // Constructor helper
    public AnexoInfoDTO(Long id, int numeroVersion, AnexoStatus estado) {
        this.id = id;
        this.numeroVersion = numeroVersion;
        this.estado = estado;
        this.color = estado == AnexoStatus.BORRADOR ? "AMARILLO" : "VERDE";
    }

    // Versión para "no existe"
    public static AnexoInfoDTO empty() {
        return new AnexoInfoDTO(null, 0, null);
    }
}