package com.dronetools.dronegestory.model.enums;

/**
 * Valores posibles para campos de verificación en Anexo 6 (13.1.x)
 */
public enum AnexoVerificacionValor {
    CORRECTO("Correcto"),
    INCORRECTO("Incorrecto"),
    NA("N/A");
    
    private final String valor;
    
    AnexoVerificacionValor(String valor) {
        this.valor = valor;
    }
    
    public String getValor() {
        return valor;
    }
    
    public static AnexoVerificacionValor fromString(String valor) {
        for (AnexoVerificacionValor v : AnexoVerificacionValor.values()) {
            if (v.valor.equals(valor)) {
                return v;
            }
        }
        return NA;
    }
}
