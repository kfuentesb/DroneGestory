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

    @Mapping(target = "operator", source = "operator")
    @Mapping(target = "insuranceCompany", source = "insuranceCompany")
    Aircraft toEntity(AircraftRequestDTO dto, Operator operator, InsuranceCompany insuranceCompany);

    @Mapping(target = "operatorId", source = "operator.id")
    @Mapping(target = "insuranceCompanyId", source = "insuranceCompany.id")
    AircraftResponseDTO toDto(Aircraft aircraft);
}