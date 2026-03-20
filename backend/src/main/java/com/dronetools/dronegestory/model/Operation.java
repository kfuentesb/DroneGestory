package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.anexos.*;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
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
import java.util.ArrayList;
import java.util.List;

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
    private User creador;

    // FECHAS AUTOMÁTICAS
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp // Actualiza con la última actualización
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Estado de la operación (enum)
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private OperationStatus estado = OperationStatus.EN_CURSO;

    // RELACIONES con ANEXOS. Para varias versiones tenemos que usar 1:N
    // CascadeType.ALL: para que al borrar operación, borro anexos
    // orphanRemoval: si quito anexo de operación, se borra de BD
    @JsonIgnore  // ← NO incluir en el JSON
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo4> anexos4 = new ArrayList<>();

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo5> anexos5 = new ArrayList<>();

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo6> anexos6 = new ArrayList<>();

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo7> anexos7 = new ArrayList<>();

    @JsonIgnore  // ← NO incluir en el JSON
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo8> anexos8 = new ArrayList<>();

    // HELPERS para obtener la version actual de cada anexo
    public Anexo4 getAnexo4Actual() {
        return anexos4.isEmpty() ? null : anexos4.getFirst();
    }

    public Anexo5 getAnexo5Actual() {
        return anexos5.isEmpty() ? null : anexos5.getFirst();
    }

    public Anexo6 getAnexo6Actual() {
        return anexos6.isEmpty() ? null : anexos6.getFirst();
    }

    public Anexo7 getAnexo7Actual() {
        return anexos7.isEmpty() ? null : anexos7.getFirst();
    }

    public Anexo8 getAnexo8Actual() {
        return anexos8.isEmpty() ? null : anexos8.getFirst();
    }

    // Verificar que todos los anexos están FIRMADOS
    public boolean todosAnexosFirmados(){
        Anexo4 a4 = getAnexo4Actual();
        Anexo5 a5 = getAnexo5Actual();
        Anexo6 a6 = getAnexo6Actual();
        Anexo7 a7 = getAnexo7Actual();
        Anexo8 a8 = getAnexo8Actual();

        return a4 != null && a4.getEstado() == AnexoStatus.FIRMADO &&
                a5 != null && a5.getEstado() == AnexoStatus.FIRMADO &&
                a6 != null && a6.getEstado() == AnexoStatus.FIRMADO &&
                a7 != null && a7.getEstado() == AnexoStatus.FIRMADO;
    }

    // Calcular la siguiente versión de cada anexo
    public int getNextVersionAnexo4() {
        return anexos4.stream().mapToInt(Anexo4::getVersionNumber).max().orElse(0) + 1;
    }

    public int getNextVersionAnexo5() {
        return anexos5.stream().mapToInt(Anexo5::getVersionNumber).max().orElse(0) + 1;
    }

    public int getNextVersionAnexo6() {
        return anexos6.stream().mapToInt(Anexo6::getVersionNumber).max().orElse(0) + 1;
    }

    public int getNextVersionAnexo7() {
        return anexos7.stream().mapToInt(Anexo7::getVersionNumber).max().orElse(0) + 1;
    }
}
