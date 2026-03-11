package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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

    @Column(name = "applicant_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicantType applicantType;

    @Column(name = "applicant_name", length = 100, nullable = false)
    private String applicantName;

    // Si ApplicantType = Manufacturer || To_the_manufacturer
    @Column(name = "manufacturer_name", length = 100)
    private String manufacturer_name;

    // Si ApplicantType = Operator ||To_the_manufacturer
    @Column(name = "operador_name", length = 100)
    private String operadorName;

    // Si ApplicantType = Operator
    @Column(name = "operator_number")
    private Integer operatorNumber;

    @Column(name= "privately_built", nullable = false)
    private Boolean privatelyBuilt;

    @Column(name = "model", length = 100, nullable = false)
    private String model;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AircraftType type;

    @Column(name = "serial_number")
    private Integer serialNumber;

    @Column(name = "class", nullable = false)
    @Enumerated(EnumType.STRING)
    private AircraftClass aircraftClass;

    @Column(name = "mtom", precision = 9, scale = 3)
    private Double mtom;

    @Column(name = "wingspan", precision = 9, scale = 3)
    private Double wingspan;

    @Column(name = "max_speed", precision = 9, scale = 3)
    private Double maxSpeed;

    @Column(name = "impact_energy", precision = 9, scale = 3)
    private Double impactEnergy;

    @Min(0)
    @Max(10000)
    @Column(name = "max_autonomy")
    private Integer maxAutonomy;

    @Column(name="camera", nullable = false)
    private Boolean camera;

    @Column(name="tether", nullable = false)
    private Boolean tether;

    @Column(name="cable_lenght", precision = 9, scale = 3)
    private Double cableLenght;

    @Column(name="power_source", nullable = false)
    @Enumerated(EnumType.STRING)
    private PowerSource powerSource;

    @Column(name="power_source_type")
    @Enumerated(EnumType.STRING)
    private PowerSourceType powerSourceType;

    @Column(name = "accessories")
    private String accessories;

    @Column(name = "observations")
    private String observations;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

//    @OneToMany(mappedBy = "aircraft")
//    private List<Operation> operations;
}