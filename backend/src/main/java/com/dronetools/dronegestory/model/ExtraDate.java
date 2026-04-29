package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "extra_date_roles", joinColumns = @JoinColumn(name = "extra_date_id"))
    @Column(name = "role_name")
    private List<String> roles;
}
