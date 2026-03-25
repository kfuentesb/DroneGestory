package com.dronetools.dronegestory.common;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// CLASE EMBEBIDA para usar en "otrosLimites"
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Embeddable
public class CampoDinamico {
    private String descripcion;
    private Boolean valor;
}