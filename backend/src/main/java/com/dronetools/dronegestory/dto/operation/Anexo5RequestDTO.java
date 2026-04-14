package com.dronetools.dronegestory.dto.operation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo5RequestDTO {
    private String nombreConops;
    private LocalDateTime fechaOp;

    // Seccion 1.1.1
    private Boolean vlos;
    private Boolean ubicacionObservadores;
    private Boolean evaluacionVisibilidadYAlcance;
    // 1.1.2
    private Boolean condicionantesAcordadosConGestor;
    // 1.1.3
    private Boolean analisisEnFuncionConops;
    private Boolean evaluacionEntornoAereoAdyacente;
    private Boolean vueloTerrestreControlado;
    // 1.2.1
    private Boolean notamActivos;
    private Boolean tsaPreviaNotam;
    private Boolean procedimientosATSP;
    // 2.1
    private Boolean condicionesClimatologicas;
    // 3.1
    private Boolean personalSabeFunciones;
    // 4
    private Boolean comunicacionEntrePersonal;
    private Boolean comunicacion3Partes;
    // 5
    private Boolean requisitosSeguridad;
    private Boolean requisitosMedioAmbiente;
    private Boolean requisitosRadioelectrico;
    private Boolean requisitosLocalesEspecificos;
    // 6
    private Boolean atenuacionesGRC;
    private Boolean atenuacionesARC;
    // 7
    private Boolean comprobacionesUasVuelo;
}
