package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.common.CampoDinamico;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "anexo4")
@Getter
@Setter
public class Anexo4 extends Anexo {

    // FORMULARIO
    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_hora_prevista")
    private LocalDateTime fechaHoraPrevista;

    // ---- RELACIÓN CON USUARIOS QUE OPERAN (PERSONAL) ----
    @ManyToMany
    @JoinTable(
            name = "anexo4_personal",
            joinColumns = @JoinColumn(name = "anexo4_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> personal = new ArrayList<>();

    // ---- RELACIÓN CON DRONES (UAS) ----
    @ManyToMany
    @JoinTable(
            name = "anexo4_aircrafts",
            joinColumns = @JoinColumn(name = "anexo4_id"),
            inverseJoinColumns = @JoinColumn(name = "aircraft_id")
    )
    private List<Aircraft> drones = new ArrayList<>();

    // --- Imágenes ---
    @Column(name = "imagen_espacio_aereo")
    private String imagenEspacioAereo;

    @Column(name = "imagen_zona_vuelo")
    private String imagenZonaVuelo;

    // BOOLEANS
    // --- Sección 4. ZONAS GEOGRÁFICAS de UAS ---
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

    // --- Seccion 6. Requisitos y limitaciones en zona de vuelo
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

    // Clase campoDinamico en package commons
//    @ElementCollection
//    @CollectionTable(name = "anexo4_campo_dinamico",
//            joinColumns = @JoinColumn(name="anexo4_id"))
//    private List<CampoDinamico> campos = new ArrayList<>();

    public Anexo4() {
        super();
        this.setTipoAnexo(4);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}