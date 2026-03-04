package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "operations")
@Getter
@Setter
@NoArgsConstructor
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "operation_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "pilot_id", nullable = false)
    private Pilot pilot;

    @ManyToOne
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "performed_at")
    private LocalDate performedAt;

    @Column(name = "status")
    private String status;

    @Column(name = "category")
    private String category;
}