package com.dronetools.dronegestory.dto.aircraft;

import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.enums.AircraftClass;
import com.dronetools.dronegestory.model.enums.AircraftConfig;
import com.dronetools.dronegestory.model.enums.SelectionStatus;
import com.dronetools.dronegestory.model.enums.AircraftPowersSource;
import com.dronetools.dronegestory.util.UploadPathUtils;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

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
    private Integer flightMinutes;
    private String fechaFab;
    private AircraftPowersSource.PowerSource powerSource;
    private AircraftPowersSource.PowerSourceType powerSourceType;

    private static final DateTimeFormatter MONTH_YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

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
        dto.setFechaFab(aircraft.getFechaFab() == null ? null : aircraft.getFechaFab().format(MONTH_YEAR_FORMATTER));
        dto.setPowerSource(aircraft.getPowerSource());
        dto.setPowerSourceType(aircraft.getPowerSourceType());
        dto.setAircraftClass(aircraft.getAircraftClass());
        dto.setMtom(aircraft.getMtom());
        dto.setWingspan(aircraft.getWingspan());
        dto.setMaxSpeed(aircraft.getMaxSpeed());
        dto.setConfig(aircraft.getConfig());
        dto.setImpactEnergy(aircraft.getImpactEnergy());
        dto.setHasCamera(aircraft.getHasCamera());
        dto.setImagePath(UploadPathUtils.toDatabaseRelativePath(aircraft.getImagePath()));
        dto.setPrivatelyBuilt(aircraft.getPrivatelyBuilt());
        dto.setHasParachute(aircraft.getHasParachute());
        dto.setHasEnsurance(aircraft.getHasEnsurance());
        dto.setHasFTS(aircraft.getHasFTS());
        dto.setCautive(aircraft.getCautive());
        dto.setAccessories(aircraft.getAccessories());
        dto.setFlightMinutes(aircraft.getFlightMinutes());
        return dto;
    }
}
