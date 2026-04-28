package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "extra_date")
@Getter
@Setter
@NoArgsConstructor
public class ExtraDate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_extra_date")
    private Long idExtraDate;

    @Column(name = "extra_date", nullable = false)
    private LocalDate extraDate;

    @Column(name = "description")
    private String description;
}
