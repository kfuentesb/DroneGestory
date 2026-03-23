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

    @Column(name = "fecha_hora_prevista")
    private LocalDateTime fechaHoraPrevista;

    @Column(name = "medios_materiales")
    private String mediosMateriales;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "coords")
    private String coords;

<<<<<<< HEAD
    @Column(name = "imagen_espacio_aereo")
    private String imagenEspacioAereo;

    // Así le decimos automáticamente de que se trata del Anexo4 al anexo base
    public Anexo4() {
        super();
        this.setTipoAnexo(4);
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
