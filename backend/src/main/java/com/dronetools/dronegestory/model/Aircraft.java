package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

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

    // ============ CAMPOS OBLIGATORIOS para el cliente ============
    @Column(name = "manufacturer", length = 100, nullable = false)
    private String manufacturer;

    @Column(name = "model", length = 100, nullable = false)
    private String model;

    @Column(name = "serial_number", nullable = false)
    @Pattern(regexp = "^[a-zA-Z0-9]{2,25}$", message = "El número de serie debe ser alfanumérico (2-25 caracteres)")
    private String serialNumber;

    @Column(name = "class", nullable = false)
    @Enumerated(EnumType.STRING)
    private AircraftClass aircraftClass;

    @Column(name = "mtom", precision = 9, scale = 3, nullable = false)
    private BigDecimal mtom;

    @Column(name = "wingspan", precision = 9, scale = 3, nullable = false)
    private BigDecimal wingspan;

    @Column(name = "max_speed", precision = 9, scale = 3, nullable = false)
    private BigDecimal maxSpeed;

    @Column(name = "config", nullable = false)
    @Enumerated(EnumType.STRING)
    private AircraftConfig config;

    @Column(name = "impact_energy", precision = 9, scale = 3, nullable = false)
    private BigDecimal impactEnergy;

    @Column(name="camera", nullable = false)
    private Boolean hasCamera;

    @Column(name = "image_path")
    private String imagePath;

    // campos añadidos en la segunda tanda de aircraft

    @Column(name = "privately_built")
    private Boolean privatelyBuilt;

    @Column(name = "has_parachute")
    private Boolean hasParachute;

    @Column(name = "has_ensurance")
    private Boolean hasEnsurance;

    @Column(name = "has_fts")
    private Boolean hasFTS;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "cautive", length = 20)
    private SelectionStatus cautive;

    @Column(name = "accessories", length = 800)
    private String accessories;

}

