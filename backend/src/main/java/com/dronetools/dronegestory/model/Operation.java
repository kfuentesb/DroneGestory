package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.common.AnexoVersionado;
import com.dronetools.dronegestory.model.anexos.*;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "operation")
@Getter
@Setter
@NoArgsConstructor
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_operacion")
    private Long operationId;

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
    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    private List<Anexo4> anexos4 = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    private List<Anexo5> anexos5 = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    private List<Anexo6> anexos6 = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    private List<Anexo7> anexos7 = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    private List<Anexo8> anexos8 = new ArrayList<>();

    // ========== MÉTODOS PRIVADOS ============
    // Obtener última versión
    private <T extends AnexoVersionado> T getUltimaVersion(List<T> lista){
        return (lista == null || lista.isEmpty() ? null : lista.getFirst());
    }

    private <T extends AnexoVersionado> int getNextVersion(List<T> anexos) {
        return anexos.stream()
                .mapToInt(AnexoVersionado::getNumeroVersion)
                .max()
                .orElse(0) + 1;
    }

    // ========== MÉTODOS PÚBLICOS ===========
    // HELPERS para obtener la version actual de cada anexo TODO Andrés quiere obtener cualquier
    public Anexo4 getAnexo4Actual() { return getUltimaVersion(anexos4);}
    public Anexo5 getAnexo5Actual() { return getUltimaVersion(anexos5);}
    public Anexo6 getAnexo6Actual() {return getUltimaVersion(anexos6);}
    public Anexo7 getAnexo7Actual() {return getUltimaVersion(anexos7);}
    public Anexo8 getAnexo8Actual() {return getUltimaVersion(anexos8);}

    // Calcular la siguiente versión de cada anexo
    public int getNextVersionAnexo4() {return getNextVersion(anexos4);}
    public int getNextVersionAnexo5() {return getNextVersion(anexos5);}
    public int getNextVersionAnexo6() {return getNextVersion(anexos6);}
    public int getNextVersionAnexo7() {return getNextVersion(anexos7);}
    public int getNextVersionAnexo8() {return getNextVersion(anexos8);}
    
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
                a7 != null && a7.getEstado() == AnexoStatus.FIRMADO &&
                a8 != null && a8.getEstado() == AnexoStatus.FIRMADO;
    }
}
