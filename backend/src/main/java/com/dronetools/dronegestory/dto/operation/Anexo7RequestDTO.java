package com.dronetools.dronegestory.dto.operation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo7RequestDTO {
    private String nombreConops;
    private LocalDateTime fechaOp;
    private String serialAeronave;
    private Integer tiempoDeVuelo;
    private Integer ciclosDeAterrizaje;

    // 1. Verificación
    private Boolean estructuraCorrecto;
    private String estructuraObservaciones;

    private Boolean bateriasCorrecto;
    private String bateriasObservaciones;

    private Boolean sensoresCorrecto;
    private String sensoresObservaciones;

    private Boolean motoresCorrecto;
    private String motoresObservaciones;

    private Boolean helicesCorrecto;
    private String helicesObservaciones;

    private Boolean partesMovilesCorrecto;
    private String partesMovilesObservaciones;

    private Boolean comunicacionesCorrecto;
    private String comunicacionesObservaciones;

    private Boolean plantaPotenciaCorrecto;
    private String plantaPotenciaObservaciones;

    private Boolean cargaPagoCorrecto;
    private String cargaPagoObservaciones;

    private Boolean identificacionRemotaCorrecto;
    private String identificacionRemotaObservaciones;

    private Boolean sistemaGeoconscienciaCorrecto;
    private String sistemaGeoconscienciaObservaciones;

    private Boolean datosVueloCorrecto;
    private String datosVueloObservaciones;

    private Boolean otrosVerificacionCorrecto;
    private String otrosVerificacionObservaciones;

    // 2. Recogida y almacenaje
    private Boolean aeronaveCorrecto;
    private String aeronaveObservaciones;

    private Boolean unidadControlCorrecto;
    private String unidadControlObservaciones;

    private Boolean sensoresRecogidaCorrecto;
    private String sensoresRecogidaObservaciones;

    private Boolean antenasCorrecto;
    private String antenasObservaciones;

    private Boolean otrosRecogidaCorrecto;
    private String otrosRecogidaObservaciones;
}
