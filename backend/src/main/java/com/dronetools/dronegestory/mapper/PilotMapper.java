package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.PilotRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotResponseDTO;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.model.Pilot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PilotMapper {

    @Mapping(target = "operator", source = "operator")
    @Mapping(target = "password", source = "encodedPassword")
    Pilot toEntity(PilotRequestDTO dto, Operator operator, String encodedPassword);

    @Mapping(target = "operatorId", source = "operator.id")
    PilotResponseDTO toDto(Pilot pilot);
}