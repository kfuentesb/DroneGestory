package com.dronetools.dronegestory.dto.anexos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO genérico para items de tablas expandibles en anexos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemTablaExpandibleDTO {
    private String descripcion;
    private String valor; // SI/NO/N/A, Correcto/Incorrecto/N/A, etc.
}
