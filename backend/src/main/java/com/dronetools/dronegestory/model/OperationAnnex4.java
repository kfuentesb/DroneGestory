package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "operation_annex4")
@Data
public class OperationAnnex4 {

    @Id
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "annex4_id")
    private Operation operation;

}
