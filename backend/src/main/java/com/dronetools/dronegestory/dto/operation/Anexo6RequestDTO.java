package com.dronetools.dronegestory.dto.operation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class Anexo6RequestDTO {
    private String nombreConops;
    private LocalDateTime fechaOp;
    private String serialAeronave;
    private List<String> materialesAuxiliares;

    // 2. Estructura
    private Boolean sinImpacto;
    private Boolean centroGravedad;
    private Boolean integridadEstructural;
    private Boolean cableado;
    private Boolean verificacionLuces;
    // 3. Sensores
    private Boolean calibracion;
    private Boolean validarSalidaDatos;
    // 4. Motores
    private Boolean giranLibremente;
    private Boolean sentidoGiroCorrecto;
    private Boolean sinImpactoMotores;
    // 5. Hélices
    private Boolean colocacionCorrecta;
    private Boolean sujetacionFirme;
    private Boolean sinImpactoHelices;
    // 6. Unidad de control
    private Boolean bateriaCarga;
    private Boolean movimientoFluidoMando;
    // 7. Partes móviles
    private Boolean sinImpactoPartesMoviles;
    private Boolean movimientoFluidoPartesMoviles;
    // 8. Comunicaciones
    private Boolean antenasInstaladasYOrientadas;
    private Boolean calidadOnda;
    private Boolean recepcionAdecuada;
    // 9. Planta de potencia
    private Boolean fuenteAlimentacion;
    private Boolean nivelFuenteAlimentacion;
    // 10. Carga de pago
    private Boolean fijacionCorrecta;
    private Boolean memoriaSuficienteParaDatos;
    private Boolean sinImpactoCargaPago;
    private Boolean conexionesCargaPago;
    // 11. Identificacion remota
    private Boolean datosCargados;
    private Boolean transmisionDatos;
    // 12. Sistema de geoconsciencia
    private Boolean informacionActualizada;
    private Boolean sistemaActivado;
}
