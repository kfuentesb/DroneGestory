package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.common.AnexoVersionado;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "anexo6")
@Getter @Setter @NoArgsConstructor
public class Anexo6 implements AnexoVersionado {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id_anexo6")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_operacion", nullable = false)
    private Operation operation;

    @Column(name = "campo_anexo6")
    private String campoAnexo6;

    // Versión
    @Column(name = "version_number", nullable = false)
    private int numeroVersion;

    // Estado
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private AnexoStatus estado = AnexoStatus.BORRADOR;

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
