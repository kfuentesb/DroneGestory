package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "anexo4")
@Getter @Setter @NoArgsConstructor
public class Anexo4 {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "anexo_id1")
    private Long id;

}
