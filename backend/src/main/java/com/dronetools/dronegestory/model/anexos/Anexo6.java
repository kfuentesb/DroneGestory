package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;
import com.dronetools.dronegestory.model.Anexo;

@Entity
@Table(name = "anexo6")
@Getter
@Setter
// @NoArgsConstructor
public class Anexo6 extends Anexo {
    
    @Column(name = "texto_prueba")
    private String textoPrueba;

<<<<<<< HEAD
    public Anexo6() {
        super();
        this.setTipoAnexo(6);
        this.setEstado(AnexoStatus.BORRADOR);
    }
=======
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_operacion", nullable = false)
    private Operation operation;

    @Column(name = "campo_anexo6")
    private String campoAnexo6;

    // Versión
    @Column(name = "numero_version", nullable = false)
    private int numeroVersion;

    // Estado
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private AnexoStatus estado = AnexoStatus.BORRADOR;

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
