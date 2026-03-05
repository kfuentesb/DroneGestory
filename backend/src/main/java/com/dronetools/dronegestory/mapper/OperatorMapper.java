package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.OperatorRequestDTO;
import com.dronetools.dronegestory.dto.response.OperatorResponseDTO;
import com.dronetools.dronegestory.model.Operator;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OperatorMapper {

    Operator toEntity(OperatorRequestDTO dto);

    OperatorResponseDTO toDto(Operator operator);
}