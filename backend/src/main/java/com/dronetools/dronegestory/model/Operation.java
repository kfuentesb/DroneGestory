package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "operation")
@Getter
@Setter
@NoArgsConstructor
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="operation_id")
    private Long operationId;

    @Column(name = "operation_name", nullable = false, length = 255)
    private String operationName;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "current_step")
    private int current_step;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // FK a app_user.user_id
    private User user;
}
