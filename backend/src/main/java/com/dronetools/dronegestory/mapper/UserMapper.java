package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.UserRequestDTO;
import com.dronetools.dronegestory.dto.response.UserResponseDTO;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "operator", source = "operator")
    @Mapping(target = "password", source = "encodedPassword")
    User toEntity(UserRequestDTO dto, Operator operator, String encodedPassword);

    @Mapping(target = "operatorId", source = "operator.id")
    UserResponseDTO toDto(User user);
}