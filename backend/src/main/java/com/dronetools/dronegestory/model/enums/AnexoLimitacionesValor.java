package com.dronetools.dronegestory.model.enums;

/**
 * Valores posibles para campos de limitaciones en Anexos 4 y 8
 */
public enum AnexoLimitacionesValor {
    SI("SI"),
    NO("NO"),
    NA("N/A");
    
    private final String valor;
    
    AnexoLimitacionesValor(String valor) {
        this.valor = valor;
    }
    
    public String getValor() {
        return valor;
    }
    
    public static AnexoLimitacionesValor fromString(String valor) {
        for (AnexoLimitacionesValor v : AnexoLimitacionesValor.values()) {
            if (v.valor.equals(valor)) {
                return v;
            }
        }
        return NA;
    }
}
