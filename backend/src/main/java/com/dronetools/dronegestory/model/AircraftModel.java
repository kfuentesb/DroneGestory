package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.AircraftPowersSource;
import com.dronetools.dronegestory.model.enums.SelectionStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "aircraft_model")
@Getter @Setter @NoArgsConstructor
public class AircraftModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "manufacturer", length = 100, nullable = false)
    private String manufacturer;

    @Column(name = "model", length = 100, nullable = false)
    private String model;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "aircraft_class_default")
    @Enumerated(EnumType.STRING)
    private AircraftClass aircraftClassDefault;

    @Column(name = "mtom_default", precision = 9, scale = 3)
    private BigDecimal mtomDefault;

    @Column(name = "wingspan_default", precision = 9, scale = 3)
    private BigDecimal wingspanDefault;

    @Column(name = "max_speed_default", precision = 9, scale = 3)
    private BigDecimal maxSpeedDefault;

    @Column(name = "config_default")
    @Enumerated(EnumType.STRING)
    private AircraftConfig configDefault;

    @Column(name = "impact_energy_default", precision = 9, scale = 3)
    private BigDecimal impactEnergyDefault;

    @Column(name = "has_camera_default")
    private Boolean hasCameraDefault;

    @Column(name = "privately_built_default")
    private Boolean privatelyBuiltDefault;

    @Column(name = "has_parachute_default")
    private Boolean hasParachuteDefault;

    @Column(name = "has_fts_default")
    private Boolean hasFTSDefault;

    @Enumerated(EnumType.STRING)
    @Column(name = "cautive_default", length = 20)
    private SelectionStatus cautiveDefault;

    @Enumerated(EnumType.STRING)
    @Column(name = "power_source_default", length = 20)
    private AircraftPowersSource.PowerSource powerSourceDefault;

    @Enumerated(EnumType.STRING)
    @Column(name = "power_source_type_default", length = 20)
    private AircraftPowersSource.PowerSourceType powerSourceTypeDefault;

    @Column(name = "accessories_default", length = 800)
    private String accessoriesDefault;
}
