package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "flight_time_documentation")
@Getter
@Setter
@NoArgsConstructor
public class FlightTimeDocumentation extends BaseDocumentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Relación con el vuelo al que pertenece esta documentación
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_time_id", nullable = false)
    private FlightTime flightTime;
    
    // Campo para guardar la ruta del archivo o el nombre físico
    @Column(name = "file_path")
    private String filePath;
}