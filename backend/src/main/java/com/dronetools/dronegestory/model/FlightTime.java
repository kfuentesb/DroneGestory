package com.dronetools.dronegestory.model;

import java.sql.Date;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "flight_time")
@Getter
@Setter
@NoArgsConstructor
public class FlightTime {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_time_id")
    private Long flightTimeId;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operation_id", nullable = true)
    private Operation operation;

    @Column(name = "flight_date", nullable = false)
    private Date flightDate;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_flight_time_minutes", nullable = false)
    private Integer totalFlightTimeMinutes;

    // Relación inversa opcional para acceder a la documentación desde el vuelo
    @OneToOne(mappedBy = "flightTime", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FlightTimeDocumentation documentation;
}