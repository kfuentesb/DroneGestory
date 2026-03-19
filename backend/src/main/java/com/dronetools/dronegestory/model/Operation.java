package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.anexos.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "operation")
@Getter
@Setter
@NoArgsConstructor
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_operacion")
    private Long idOperacion;

    @Column(name = "nombre_operacion", nullable = false, length = 255)
    private String nombreOperacion;

//    @Column(name = "fechaActual")
//    private LocalDate fechaActual;

//    @Column(name = "paso_actual")
//    private int pasoActual;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false) // FK a app_user.user_id
//    private User user;
    @JsonIgnore  // ← NO incluir en el JSON
    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Anexo4 anexo4;

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Anexo5 anexo5;

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Anexo6 anexo6;

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Anexo7 anexo7;

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Anexo8 anexo8;

}
