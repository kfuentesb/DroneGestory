package com.dronetools.dronegestory.model.anexos;


import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.dronetools.dronegestory.model.Anexo;

import java.time.LocalDateTime;

@Entity
@Table(name = "anexo8")
@Getter
@Setter
public class Anexo8 extends Anexo {

    @Column(name = "nombre_conops")
    private String nombreConops;

    @Column(name = "fechaOp")
    private LocalDateTime fechaOp;

    // 1. Condiciones y limitaciones de zonas geográficas de UAS
    // 1.1 Si la operación se lleva a cabo en espacio aereo controlado o FIZ
    private Boolean condicionesATSP;
    // 1.2 Otras condiciones
    private Boolean comunicacion3FinalizacionOperacion;
    private Boolean comunicacionZrvfCecaf;
    // 2. Registro de datos de vuelo y eventos
    // 2.1 Registro de actividad de vuelo
    private Boolean anotacionTiempoVueloAeronave;
    private Boolean anotacionTIempoActividadPersonal;
    // 2.2 Registro y comunicación de eventos significativos;
    private Boolean anotacionEventosOcurridosOperacion;
    private Boolean comunicacionIncidentes;
    // 2.3 OTROS TODO

    public Anexo8() {
        super();
        this.setTipoAnexo(8);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
