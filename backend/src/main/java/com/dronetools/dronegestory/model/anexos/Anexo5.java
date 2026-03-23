package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.Anexo;
import jakarta.persistence.*;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "anexo5")
@Getter
@Setter
// @NoArgsConstructor
public class Anexo5 extends Anexo {

    @Column(name = "texto_prueba")
    private String textoPrueba;

    // @Column(name = "fecha_hora_prevista")
    // private LocalDateTime fechaHoraPrevista;

<<<<<<< HEAD
    // @Column(name = "medios_materiales")
    // private String mediosMateriales;
=======
    // Versión
    @Column(name = "numero_version", nullable = false)
    private int numeroVersion;
>>>>>>> 2b8ea28fe6b695519ccd7f9cbe25010a3bae1dfe

    // @Column(name = "direccion")
    // private String direccion;

<<<<<<< HEAD
    // @Column(name = "coords")
    // private String coords;

    // @Column(name = "imagen_espacio_aereo")
    // private String imagenEspacioAereo;

    public Anexo5() {
        super();
        this.setTipoAnexo(5);
        this.setEstado(AnexoStatus.BORRADOR);
    }
=======
    // ========== MÉTODOS ===========
    public boolean isEditable() {
        return this.estado == AnexoStatus.BORRADOR;
    }

//    @Column(name = "fecha_hora_prevista")
//    private LocalDateTime fechaHoraPrevista;
//
//    @Column(name = "medios_materiales")
//    private String mediosMateriales;
//
//    @Column(name = "direccion")
//    private String direccion;
//
//    @Column(name = "coords")
//    private String coords;
//
//    @Column(name = "imagen_espacio_aereo")
//    private String imagenEspacioAereo;
>>>>>>> 2b8ea28fe6b695519ccd7f9cbe25010a3bae1dfe
}
