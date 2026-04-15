package com.dronetools.dronegestory.dto.operation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo4RequestDTO {
    // CAMPOS PRINCIPALES
    private String descripcion;
    private LocalDateTime fechaHoraPrevista;
    private String mediosMateriales;
    private String direccion;
    private String coords;

    // RELACIONES
    private String personal;   // IDs de usuarios
//    private List<Integer> dronesIds;     // IDs de drones

    // IMÁGENES
    private String imagenEspacioAereo;
    private String imagenZonaVuelo;

    // BOOLEANS (sección 4 - Zonas geográficas)
    private Boolean espacioAereoControlado; // 4.1
    private Boolean estudioAeronauticoCoordinado; // 4.1.1
    private Boolean entornoAerodromos; // 4.2
    private Boolean distanciaMinimaInfraestructuras; // 4.2.1
    private Boolean zonasProhibidasFlexible; // 4.3
    private Boolean cumpleCondiciones; // 4.3.1
    private Boolean zonasSeguridad; // 4.4
    private Boolean permisoPrevioSeguridad; // 4.4.1
    private Boolean serviciosEsencialesComunidad; // 4.5
    private Boolean permisoPrevioServicios; // 4.5.1
    private Boolean entornosUrbanos; // 4.6
    private Boolean cumplenDistanciasEdificios; // 4.6.1
    private Boolean comunicacionMinisterioInterior; // 4.62
    private Boolean zonaResVueloFotografico; // 4.7
    private Boolean permisoCecaf; // 4.7.1
    private Boolean zonasProtMedioambiental; // 4.8
    private Boolean disponeCoordGestor; // 4.8.1

    // BOOLEANS (sección 6 - Requisitos y limitaciones en zona de vuelo)
    private Boolean conopsYModeloSemantico; // 6.1
    private Boolean aplicaModelo; // 6.1.1
    private Boolean defineGeografiaVueloConops; // 6.1.2
    private Boolean defineVolContigencia; // 6.1.3
    private Boolean defineMargenRiesgoTierra; // 6.1.4
    private Boolean defineZonaTerrestreControlada; // 6.1.5
    private Boolean planificaUbicacionObservadores; // 6.1.6
    private Boolean calculaAreaYEvaluaRiesgo; // 6.1.7
    private Boolean notams; // 6.2
    private Boolean revisaNotams; // 6.2.1
    private Boolean tsaOCondicionada; // 6.2.2
    private Boolean otrasLimitaciones; // 6.3

    // Si quieres: puedes añadir más campos según evolucione el modelo/anexo.
}