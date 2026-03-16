package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "operation")
@Getter
@Setter
@NoArgsConstructor
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="operation_id")
    private Long id;

    @Column(name = "operation")
    private String operation;

    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private OperationAnnex4 annex4;

    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL)
    private OperationAnnex5 annex5;

    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL)
    private OperationAnnex6 annex6;

    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL)
    private OperationAnnex7 annex7;

    @OneToOne(mappedBy = "operation", cascade = CascadeType.ALL)
    private OperationAnnex8 annex8;
}
