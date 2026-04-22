package com.dronetools.dronegestory.model.anexos;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Clase embebida genérica para tablas expandibles en anexos.
 * Usada en Anexo 4 (limitaciones), Anexo 6 (verificación), Anexo 8 (limitaciones)
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemTablaExpandible {
    
    @Column(name = "descripcion", length = 500)
    private String descripcion;
    
    @Column(name = "valor", length = 50)
    private String valor; // Valores: SI/NO/N/A, Correcto/Incorrecto/N/A, etc.
}
