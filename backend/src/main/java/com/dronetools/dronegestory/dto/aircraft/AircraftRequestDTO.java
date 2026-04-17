package com.dronetools.dronegestory.dto.aircraft;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.AircraftModel;
import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.AircraftPowersSource;
import com.dronetools.dronegestory.model.enums.SelectionStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AircraftRequestDTO {

    private String manufacturer;
    private String model;
    private String serialNumber;
    private AircraftClass aircraftClass;
    private BigDecimal mtom;
    private BigDecimal wingspan;
    private BigDecimal maxSpeed;
    private AircraftConfig config;
    private BigDecimal impactEnergy;
    private Boolean hasCamera;
    private String fechaFab;
    private AircraftPowersSource.PowerSource powerSource;
    private AircraftPowersSource.PowerSourceType powerSourceType;

    private Boolean privatelyBuilt;
    private Boolean hasParachute;
    private Boolean hasEnsurance;
    private Boolean hasFTS;
    private SelectionStatus cautive;
    private String accessories;
    private Integer flightMinutes;

    // Legacy aliases accepted for multipart binding compatibility.
    private Boolean parachute;
    private Boolean hasInsurance;
    private Boolean hasFts;
    private String tether;
    private String observations;

    public Aircraft toEntity(AircraftModel aircraftModel) {
        Aircraft aircraft = new Aircraft();
        aircraft.setAircraftModel(aircraftModel);

        // aircraft.setManufacturer(manufacturer);
        // aircraft.setModel(model);
        aircraft.setSerialNumber(serialNumber);
        aircraft.setAircraftClass(aircraftClass);
        aircraft.setMtom(mtom);
        aircraft.setWingspan(wingspan);
        aircraft.setMaxSpeed(maxSpeed);
        aircraft.setConfig(config);
        aircraft.setImpactEnergy(impactEnergy);
        aircraft.setHasCamera(hasCamera);
        aircraft.setPrivatelyBuilt(privatelyBuilt);
        aircraft.setFechaFab(LocalDate.parse(fechaFab));
        aircraft.setPowerSource(powerSource);
        aircraft.setPowerSourceType(powerSourceType);

        aircraft.setHasParachute(resolveBoolean(hasParachute, parachute));
        aircraft.setHasEnsurance(resolveBoolean(hasEnsurance, hasInsurance));
        aircraft.setHasFTS(resolveBoolean(hasFTS, hasFts));
        aircraft.setCautive(resolveSelectionStatus(cautive, tether));
        aircraft.setAccessories(resolveAccessories(accessories, observations));
        aircraft.setFlightMinutes(flightMinutes != null ? flightMinutes : 0);

        return aircraft;
    }

    private static Boolean resolveBoolean(Boolean canonical, Boolean alias) {
        return canonical != null ? canonical : alias;
    }

    private static SelectionStatus resolveSelectionStatus(SelectionStatus canonical, String alias) {
        if (canonical != null) {
            return canonical;
        }
        if (alias == null || alias.isBlank()) {
            return null;
        }
        try {
            return SelectionStatus.valueOf(alias.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private static String resolveAccessories(String canonical, String alias) {
        if (canonical != null && !canonical.isBlank()) {
            return canonical;
        }
        if (alias != null && !alias.isBlank()) {
            return alias;
        }
        return canonical;
    }
}
