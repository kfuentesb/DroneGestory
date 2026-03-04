package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "pilot_certifications")
@Getter
@Setter
@NoArgsConstructor
public class PilotCertification {

    @EmbeddedId
    private PilotCertificationId id;

    @ManyToOne
    @MapsId("pilotId")
    @JoinColumn(name = "pilot_id", nullable = false)
    private Pilot pilot;

    @ManyToOne
    @MapsId("certificationId")
    @JoinColumn(name = "certification_id", nullable = false)
    private Certification certification;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}