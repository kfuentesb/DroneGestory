package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "operation_annex5")
@Data
public class OperationAnnex5 {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_id")
    private Operation operation;
}
