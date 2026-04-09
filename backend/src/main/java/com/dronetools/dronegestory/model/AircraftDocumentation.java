package com.dronetools.dronegestory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "aircraft_documentation")
@Getter
@Setter
@NoArgsConstructor
public class AircraftDocumentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aircraft_documentation_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "documentation_type")
    private String documentationType;

    @Column(name = "documentation_name")
    private String documentationName;

    @Column(name = "expire_date")
    private LocalDate expireDate;

    @Column(name = "date_indefinite")
    private Boolean dateIndefinite;
}
