package com.dronetools.dronegestory.dto.aircraft;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.SelectionStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AircraftResponseDTO {

    private Long id;
    private Long aircraftModelId;
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
    private String imagePath;
    private Boolean privatelyBuilt;
    private Boolean hasParachute;
    private Boolean hasEnsurance;
    private Boolean hasFTS;
    private SelectionStatus cautive;
    private String accessories;

    public static AircraftResponseDTO fromEntity(Aircraft aircraft) {
        AircraftResponseDTO dto = new AircraftResponseDTO();
        dto.setId(aircraft.getAircraftId());
        
        // Extract data from the nested Model entity
        if (aircraft.getAircraftModel() != null) {
            dto.setAircraftModelId(aircraft.getAircraftModel().getId());
            dto.setManufacturer(aircraft.getAircraftModel().getManufacturer());
            dto.setModel(aircraft.getAircraftModel().getModel());
        }

        dto.setSerialNumber(aircraft.getSerialNumber());
        dto.setAircraftClass(aircraft.getAircraftClass());
        dto.setMtom(aircraft.getMtom());
        dto.setWingspan(aircraft.getWingspan());
        dto.setMaxSpeed(aircraft.getMaxSpeed());
        dto.setConfig(aircraft.getConfig());
        dto.setImpactEnergy(aircraft.getImpactEnergy());
        dto.setHasCamera(aircraft.getHasCamera());
        dto.setImagePath(aircraft.getImagePath());
        dto.setPrivatelyBuilt(aircraft.getPrivatelyBuilt());
        dto.setHasParachute(aircraft.getHasParachute());
        dto.setHasEnsurance(aircraft.getHasEnsurance());
        dto.setHasFTS(aircraft.getHasFTS());
        dto.setCautive(aircraft.getCautive());
        dto.setAccessories(aircraft.getAccessories());
        return dto;
    }
}
