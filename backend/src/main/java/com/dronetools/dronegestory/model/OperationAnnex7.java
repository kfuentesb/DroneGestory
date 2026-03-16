package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "operation_annex7")
@Data
public class OperationAnnex7 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "annex7_id")
    private Long id;

    private String status;

}
