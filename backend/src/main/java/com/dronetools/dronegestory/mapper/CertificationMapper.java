package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.CertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.CertificationResponseDTO;
import com.dronetools.dronegestory.model.Certification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CertificationMapper {

    Certification toEntity(CertificationRequestDTO dto);

    CertificationResponseDTO toDto(Certification certification);
}