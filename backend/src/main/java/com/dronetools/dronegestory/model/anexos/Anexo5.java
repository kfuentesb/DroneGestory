package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "anexo5")
@Getter
@Setter
public class Anexo5 extends Anexo {

    @Column(name = "nombre_conops")
    private String nombreConops;

    @Column(name = "fechaOp")
    private LocalDateTime fechaOp;

    // BOOLEANS
    // Seccion 1. Lugar de la operación
    // 1.1 Evaluación del área
    // 1.1.1 Terreno, obstáculos y obstrucciones
    private Boolean vlos;
    private Boolean ubicacionObservadores;
    private Boolean evaluacionVisibilidadYAlcance;
    // 1.1.2 Si la operación se lleva a cabo próxima a aeropuertos, aeródromos y helipuertos
    private Boolean condicionantesAcordadosConGestor;
    // 1.1.3 Otros
    private Boolean analisisEnFuncionConops;
    private Boolean evaluacionEntornoAereoAdyacente;
    private Boolean vueloTerrestreControlado;
    // 1.2
    // 1.2.1 NOTAM
    private Boolean notamActivos;
    private Boolean tsaPreviaNotam;
    private Boolean procedimientosATSP;
    // 2 Condiciones ambientales
    // 2.1
    private Boolean condicionesClimatologicas;
    // 3. Personal
    // 3.1
    private Boolean personalSabeFunciones;
    // 4. Procedimientos de comunicación
    private Boolean comunicacionEntrePersonal;
    private Boolean comunicacion3Partes;
    // 5. Requisitos adicionales
    private Boolean requisitosSeguridad;
    private Boolean requisitosMedioAmbiente;
    private Boolean requisitosRadioelectrico;
    private Boolean requisitosLocalesEspecificos;
    // 6. Atenuaciones al riesgo
    private Boolean atenuacionesGRC;
    private Boolean atenuacionesARC;
    // 7. El uas esta en condiciones adecuadas para operar
    private Boolean comprobacionesUasVuelo;
    // 8. Aptitud para operar

        @ManyToMany(fetch = FetchType.EAGER)
        @JoinTable(
            name = "anexo5_signed_users",
            joinColumns = @JoinColumn(name = "anexo5_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
        )
        private Set<User> signedUsers = new LinkedHashSet<>();


    public Anexo5() {
        super();
        this.setTipoAnexo(5);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}