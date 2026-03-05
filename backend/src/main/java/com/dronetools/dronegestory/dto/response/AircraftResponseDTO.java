package com.dronetools.dronegestory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AircraftResponseDTO {
    private Integer id;
    private Integer operatorId;
    private Integer insuranceCompanyId;
    private String name;
    private Integer serialNumber;
    private String status;
    private String manufacturer;
    private String model;
    private String imagePath;
    private LocalDate purchaseDate;
}