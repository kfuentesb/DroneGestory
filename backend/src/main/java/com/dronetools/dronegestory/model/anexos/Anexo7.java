package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "anexo7")
@Getter
@Setter
public class Anexo7 extends Anexo {
    
    @Column(name = "nombre_conops")
    private String nombreConops;

    @Column(name = "fechaOp")
    private LocalDateTime fechaOp;

    @Column(name = "serial_aeronave")
    private String serialAeronave;

    @Column(name = "minutos_vuelo")
    private Integer minutosVuelo;

    // 1. Verificación - 13 elementos
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

    // 2. Recogida y almacenaje - 5 elementos
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

    public Anexo7() {
        super();
        this.setTipoAnexo(7);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
