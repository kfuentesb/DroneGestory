package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.InsuranceCompanyRequestDTO;
import com.dronetools.dronegestory.dto.response.InsuranceCompanyResponseDTO;

import java.util.List;
import java.util.Optional;

public interface InsuranceCompanyDtoService {
    List<InsuranceCompanyResponseDTO> findAll();
    Optional<InsuranceCompanyResponseDTO> findById(Integer id);
    InsuranceCompanyResponseDTO create(InsuranceCompanyRequestDTO dto);
    Optional<InsuranceCompanyResponseDTO> update(Integer id, InsuranceCompanyRequestDTO dto);
    void deleteById(Integer id);
}