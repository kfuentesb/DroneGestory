package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "operation_annex6")
@Data
public class OperationAnnex6 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "annex6_id")
    private Long id;

    private String material;
}
