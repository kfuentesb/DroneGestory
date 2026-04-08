package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.common.AnexoVersionado;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "anexos_base")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter 
@Setter 
@NoArgsConstructor
public abstract class Anexo implements AnexoVersionado {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_operacion", nullable = false)
    private Operation operation;
    
    @Column(name = "numero_version", nullable = false)
    private int numeroVersion;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private AnexoStatus estado;
    
    @Column(name = "tipo_anexo")
    private Integer tipoAnexo; // 4, 5, 6, 7 u 8

    @Column(name = "firmado_por")
    private String firmadoPor;

    @Column(name = "fecha_firma")
    private LocalDateTime fechaFirma;
}
