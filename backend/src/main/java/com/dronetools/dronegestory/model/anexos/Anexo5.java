package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.common.AnexoVersionado;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "anexo5")
@Getter @Setter @NoArgsConstructor
public class Anexo5 implements AnexoVersionado {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id_anexo5")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_operacion", nullable = false)
    private Operation operation;

    @Column(name = "campo_anexo5")
    private String campoAnexo5;

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
}
