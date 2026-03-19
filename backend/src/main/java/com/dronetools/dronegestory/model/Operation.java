package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.anexos.*;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
//@Table(name = "operation" , indexes = {
//        @Index(name = "idx_operations_user_id", columnList = "user_id"),
//        @Index(name = "idx_operations_fecha_creacion", columnList = "fecha_creacion DESC"),
//        @Index(name = "idx_operations_estado", columnList = "estado")
//}) INCLUYE INDEXs para facilitar las búsquedas
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

    // Usuario que creó la operación
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // FK a app_user.user_id
    private User createdBy;

    // Fecha automática cuando se crea
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    // Updatea con la última actualización
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Estado de la operación (enum)
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private OperationStatus estado = OperationStatus.EN_PROCESO;

    // RELACIONES con ANEXOS. Para varias versiones tenemos que usar 1:N, pero de momento 1:1
    // CascadeType.ALL: para que al borrar operación, borro anexos
    // orphanRemoval: si quito anexo de operación, se borra de BD
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

    // Helper methos para mantener la consistencia bidirecional para evitar referencias rotas
    //    Operation op = new Operation();
    //    Anexo4 a4 = new Anexo4();
    //    op.setAnexo4(a4);
    //          Ahora op.anexo4 == a4
    //          Y a4.operation == op
    public void setAnexo4(Anexo4 anexo) {
        this.anexo4 = anexo;
        if (anexo != null) {
            anexo.setOperation(this);
        }
    }

    public void setAnexo5(Anexo5 anexo) {
        this.anexo5 = anexo;
        if (anexo != null) {
            anexo.setOperation(this);
        }
    }

    public void setAnexo6(Anexo6 anexo) {
        this.anexo6 = anexo;
        if (anexo != null) {
            anexo.setOperation(this);
        }
    }

    public void setAnexo7(Anexo7 anexo) {
        this.anexo7 = anexo;
        if (anexo != null) {
            anexo.setOperation(this);
        }
    }

    public void setAnexo8(Anexo8 anexo) {
        this.anexo8 = anexo;
        if (anexo != null) {
            anexo.setOperation(this);
        }
    }
}
