package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "anexo4")
@Getter 
@Setter 
// @NoArgsConstructor
public class Anexo4 extends Anexo {

    // FORMULARIO
    @Column(name = "codigo")
    private String codigo;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_hora_prevista")
    private LocalDateTime fechaHoraPrevista;

    // TODO
    //private List<String> personal = new ArrayList();
    //private List<String> uas = new ArrayList();

    @Column(name = "medios_materiales")
    private String mediosMateriales;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "coords")
    private String coords;

    // IMÁGENES
    @Column(name = "imagen_espacio_aereo")
    private String imagenEspacioAereo;

    @Column(name = "imagen_zona_vuelo")
    private String imagenZonaVuelo;

    // BOOLEANS
    // --- Sección 4. ZONAS GEOGRÁFICAS de UAS ---

    private Boolean espacioAereoControlado;
    private Boolean estudioAeronauticoCoordinado;
    private Boolean entornoAerodromos;
    private Boolean distanciaMinimaInfraestructuras;
    private Boolean zonasProhibidasFlexible;
    private Boolean cumpleCondiciones;
    private Boolean zonasSeguridad;
    private Boolean permisoPrevioSeguridad;
    private Boolean serviciosEsencialesComunidad;
    private Boolean permisoPrevioServicios;
    private Boolean entornosUrbanos;
    private Boolean cumplenDistanciasEdificios;
    private Boolean comunicacionMinisterioInterior;
    private Boolean zonaResVueloFotografico;
    private Boolean permisoCecaf;
    private Boolean zonasProtMedioambiental;
    private Boolean disponeCoordGestor;

    // --- Seccion 6. Requisitos y limitaciones en zona de vuelo
    private Boolean conopsYModeloSemantico;
    private Boolean aplicaModelo;
    private Boolean defineGeografiaVueloConops;
    private Boolean defineVolContigencia;
    private Boolean defineMargenRiesgoTierra;
    private Boolean defineZonaTerrestreControlada;



    // Así le decimos automáticamente de que se trata del Anexo4 al anexo base
    public Anexo4() {
        super();
        this.setTipoAnexo(4);
        this.setEstado(AnexoStatus.BORRADOR);
    }



}
