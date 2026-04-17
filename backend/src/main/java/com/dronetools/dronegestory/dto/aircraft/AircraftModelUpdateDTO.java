package com.dronetools.dronegestory.dto.aircraft;

import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.AircraftPowersSource;
import com.dronetools.dronegestory.model.enums.SelectionStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AircraftModelUpdateDTO {
    private String manufacturer;
    private String model;
    private AircraftClass aircraftClassDefault;
    private BigDecimal mtomDefault;
    private BigDecimal wingspanDefault;
    private BigDecimal maxSpeedDefault;
    private AircraftConfig configDefault;
    private BigDecimal impactEnergyDefault;
    private Boolean hasCameraDefault;
    private Boolean privatelyBuiltDefault;
    private Boolean hasParachuteDefault;
    private Boolean hasEnsuranceDefault;
    private Boolean hasFTSDefault;
    private AircraftPowersSource.PowerSource powerSourceDefault;
    private AircraftPowersSource.PowerSourceType powerSourceTypeDefault;
    private SelectionStatus cautiveDefault;
    private String accessoriesDefault;
}
