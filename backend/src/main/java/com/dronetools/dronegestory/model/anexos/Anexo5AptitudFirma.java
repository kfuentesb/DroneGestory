package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "anexo5_aptitud_firma",
        uniqueConstraints = @UniqueConstraint(name = "uk_anexo5_aptitud_firma_user", columnNames = {"anexo5_id", "user_id"})
)
@Getter
@Setter
public class Anexo5AptitudFirma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "anexo5_id", nullable = false)
    private Anexo5 anexo5;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "fecha_firma", nullable = false)
    private LocalDateTime fechaFirma;
}
