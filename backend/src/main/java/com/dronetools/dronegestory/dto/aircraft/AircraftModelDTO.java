package com.dronetools.dronegestory.dto.aircraft;

import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.AircraftPowersSource;
import com.dronetools.dronegestory.model.enums.SelectionStatus;

import java.math.BigDecimal;

public record AircraftModelDTO(
    Long id,
    String manufacturer,
    String model,
    String imagePath,
    AircraftClass aircraftClassDefault,
    BigDecimal mtomDefault,
    BigDecimal wingspanDefault,
    BigDecimal maxSpeedDefault,
    AircraftConfig configDefault,
    BigDecimal impactEnergyDefault,
    Boolean hasCameraDefault,
    Boolean privatelyBuiltDefault,
    Boolean hasParachuteDefault,
    Boolean hasFTSDefault,
    AircraftPowersSource.PowerSource powerSourceDefault,
    AircraftPowersSource.PowerSourceType powerSourceTypeDefault,
    SelectionStatus cautiveDefault,
    String accessoriesDefault
) {}
