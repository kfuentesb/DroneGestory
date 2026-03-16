package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "anexo4")
@Getter @Setter @NoArgsConstructor
public class Anexo4 {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id_anexo4")
    private Long id;

    // Relación 1:1 con Operacion (un anexo4 por operación)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_operacion", nullable = false, unique = true)
    private Operation operation;

    @Column(name = "descripcion_objetivos", columnDefinition = "TEXT")
    private String descripcionObjetivos;

    @Column(name = "fecha_hora_prevista")
    private LocalDateTime fechaHoraPrevista;

    @Column(name = "medios_materiales")
    private String mediosMateriales;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "coords")
    private String coords;

    @Column(name = "imagen_espacio_aereo")
    private String imagenEspacioAereo;
}
