package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.PilotCertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotCertificationResponseDTO;
import com.dronetools.dronegestory.model.Certification;
import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PilotCertificationMapper {

    @Mapping(target = "id", expression = "java(new PilotCertificationId(dto.getPilotId(), dto.getCertificationId()))")
    @Mapping(target = "pilot", source = "pilot")
    @Mapping(target = "certification", source = "certification")
    PilotCertification toEntity(PilotCertificationRequestDTO dto, Pilot pilot, Certification certification);

    @Mapping(target = "pilotId", source = "pilot.id")
    @Mapping(target = "certificationId", source = "certification.id")
    PilotCertificationResponseDTO toDto(PilotCertification pc);
}