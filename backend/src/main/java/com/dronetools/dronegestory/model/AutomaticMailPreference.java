package com.dronetools.dronegestory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "automatic_mail_preference")
@Getter
@Setter
@NoArgsConstructor
public class AutomaticMailPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "automatic_mail_preference_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "certificates_enabled", nullable = false)
    private boolean certificates;

    @Column(name = "operations_enabled", nullable = false)
    private boolean operations;

    @Column(name = "maintenance_enabled", nullable = false)
    private boolean maintenance;

    @Column(name = "events_enabled", nullable = false)
    private boolean events;
}
