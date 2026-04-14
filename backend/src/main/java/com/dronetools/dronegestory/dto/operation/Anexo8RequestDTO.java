package com.dronetools.dronegestory.dto.operation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo8RequestDTO {
    private String nombreConops;
    private LocalDateTime fechaOp;

    // 1.1
    private Boolean condicionesATSP;
    // 1.2
    private Boolean comunicacion3FinalizacionOperacion;
    private Boolean comunicacionZrvfCecaf;
    // 2.1
    private Boolean anotacionTiempoVueloAeronave;
    private Boolean anotacionTIempoActividadPersonal;
    // 2.2
    private Boolean anotacionEventosOcurridosOperacion;
    private Boolean comunicacionIncidentes;
}
