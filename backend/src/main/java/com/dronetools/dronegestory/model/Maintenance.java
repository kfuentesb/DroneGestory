package com.dronetools.dronegestory.model;

import java.sql.Date;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "maintenance")
@Getter
@Setter
@NoArgsConstructor
public class Maintenance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "review_type", nullable = false)
    private String reviewType;

    @Column(name = "months_required", nullable = false)
    private Integer monthsRequired;

    @Column(name = "hours_flight_required", nullable = false)
    private Integer hoursFlightRequired;

    @Column(name = "maintenance_date", nullable = false)
    private Date maintenanceDate;

    @Column(name = "next_maintenance_date")
    private Date nextMaintenanceDate;

    @Column(name = "comments", length = 500)
    private String comments;

    @OneToOne(mappedBy = "maintenance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private MaintenanceDocumentation documentation;
}
