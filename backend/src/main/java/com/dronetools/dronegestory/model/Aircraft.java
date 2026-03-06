package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "aircraft")
@Getter
@Setter
@NoArgsConstructor
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aircraft_id")
    private Integer id;

//    @ManyToOne
//    @JoinColumn(name = "operator_id", nullable = false)
//    private Operator operator;
//
//    @ManyToOne
//    @JoinColumn(name = "insurance_company_id", nullable = false)
//    private InsuranceCompany insuranceCompany;

    @Column(name = "name")
    private String name;

    @Column(name = "serial_number")
    private Integer serialNumber;

    @Column(name = "status")
    private String status;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "model")
    private String model;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

//    @OneToMany(mappedBy = "aircraft")
//    private List<Operation> operations;
}