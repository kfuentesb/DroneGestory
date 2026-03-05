package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.AircraftRequestDTO;
import com.dronetools.dronegestory.dto.response.AircraftResponseDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.InsuranceCompany;
import com.dronetools.dronegestory.model.Operator;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AircraftMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "operations", ignore = true)
    @Mapping(target = "operator", source = "operator")
    @Mapping(target = "insuranceCompany", source = "insuranceCompany")
    @Mapping(target = "name", source = "dto.name")
    @Mapping(target = "serialNumber", source = "dto.serialNumber")
    @Mapping(target = "status", source = "dto.status")
    @Mapping(target = "manufacturer", source = "dto.manufacturer")
    @Mapping(target = "model", source = "dto.model")
    @Mapping(target = "imagePath", source = "dto.imagePath")
    @Mapping(target = "purchaseDate", source = "dto.purchaseDate")
    Aircraft toEntity(AircraftRequestDTO dto, Operator operator, InsuranceCompany insuranceCompany);

    @Mapping(target = "operatorId", source = "operator.id")
    @Mapping(target = "insuranceCompanyId", source = "insuranceCompany.id")
    AircraftResponseDTO toDto(Aircraft aircraft);
}