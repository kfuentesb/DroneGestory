package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.OperationRequestDTO;
import com.dronetools.dronegestory.dto.response.OperationResponseDTO;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.Pilot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OperationMapper {

    @Mapping(target = "pilot", source = "pilot")
    @Mapping(target = "aircraft", source = "aircraft")
    Operation toEntity(OperationRequestDTO dto, Pilot pilot, Aircraft aircraft);

    @Mapping(target = "pilotId", source = "pilot.id")
    @Mapping(target = "aircraftId", source = "aircraft.id")
    OperationResponseDTO toDto(Operation operation);
}