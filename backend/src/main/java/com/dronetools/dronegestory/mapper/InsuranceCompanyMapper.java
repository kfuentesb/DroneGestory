package com.dronetools.dronegestory.mapper;

import com.dronetools.dronegestory.dto.request.InsuranceCompanyRequestDTO;
import com.dronetools.dronegestory.dto.response.InsuranceCompanyResponseDTO;
import com.dronetools.dronegestory.model.InsuranceCompany;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InsuranceCompanyMapper {

    InsuranceCompany toEntity(InsuranceCompanyRequestDTO dto);

    InsuranceCompanyResponseDTO toDto(InsuranceCompany company);
}