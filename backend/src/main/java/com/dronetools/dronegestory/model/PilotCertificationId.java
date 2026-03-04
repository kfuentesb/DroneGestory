package com.dronetools.dronegestory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class PilotCertificationId implements Serializable {

    @Column(name = "pilot_id")
    private Integer pilotId;

    @Column(name = "certification_id")
    private Integer certificationId;
}