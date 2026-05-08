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

    @Column(name = "aircraft_id")
    private Long aircraftId;

    @Column(name = "tiempo_vuelo_minutos")
    private Integer tiempoVueloMinutos;

    @Column(name = "ciclos_aterrizaje")
    private Integer ciclosAterrizaje;

    // 1. Verificación - 13 elementos
    private Boolean estructuraCorrecto;
    @Column(columnDefinition = "TEXT")
    private String estructuraObservaciones;

    private Boolean bateriasCorrecto;
    @Column(columnDefinition = "TEXT")
    private String bateriasObservaciones;

    private Boolean sensoresCorrecto;
    @Column(columnDefinition = "TEXT")
    private String sensoresObservaciones;

    private Boolean motoresCorrecto;
    @Column(columnDefinition = "TEXT")
    private String motoresObservaciones;

    private Boolean helicesCorrecto;
    @Column(columnDefinition = "TEXT")
    private String helicesObservaciones;

    private Boolean partesMovilesCorrecto;
    @Column(columnDefinition = "TEXT")
    private String partesMovilesObservaciones;

    private Boolean comunicacionesCorrecto;
    @Column(columnDefinition = "TEXT")
    private String comunicacionesObservaciones;

    private Boolean plantaPotenciaCorrecto;
    @Column(columnDefinition = "TEXT")
    private String plantaPotenciaObservaciones;

    private Boolean cargaPagoCorrecto;
    @Column(columnDefinition = "TEXT")
    private String cargaPagoObservaciones;

    private Boolean identificacionRemotaCorrecto;
    @Column(columnDefinition = "TEXT")
    private String identificacionRemotaObservaciones;

    private Boolean sistemaGeoconscienciaCorrecto;
    @Column(columnDefinition = "TEXT")
    private String sistemaGeoconscienciaObservaciones;

    private Boolean datosVueloCorrecto;
    @Column(columnDefinition = "TEXT")
    private String datosVueloObservaciones;

    private Boolean otrosVerificacionCorrecto;
    @Column(columnDefinition = "TEXT")
    private String otrosVerificacionObservaciones;

    // 2. Recogida y almacenaje - 5 elementos
    private Boolean aeronaveCorrecto;
    @Column(columnDefinition = "TEXT")
    private String aeronaveObservaciones;

    private Boolean unidadControlCorrecto;
    @Column(columnDefinition = "TEXT")
    private String unidadControlObservaciones;

    private Boolean sensoresRecogidaCorrecto;
    @Column(columnDefinition = "TEXT")
    private String sensoresRecogidaObservaciones;

    private Boolean antenasCorrecto;
    @Column(columnDefinition = "TEXT")
    private String antenasObservaciones;

    private Boolean otrosRecogidaCorrecto;
    @Column(columnDefinition = "TEXT")
    private String otrosRecogidaObservaciones;

    public Anexo7() {
        super();
        this.setTipoAnexo(7);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
