package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.InsuranceCompanyRequestDTO;
import com.dronetools.dronegestory.dto.response.InsuranceCompanyResponseDTO;
import com.dronetools.dronegestory.mapper.InsuranceCompanyMapper;
import com.dronetools.dronegestory.model.InsuranceCompany;
import com.dronetools.dronegestory.repository.InsuranceCompanyRepository;
import com.dronetools.dronegestory.service.InsuranceCompanyDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InsuranceCompanyDtoServiceImpl implements InsuranceCompanyDtoService {

    private final InsuranceCompanyRepository insuranceCompanyRepository;
    private final InsuranceCompanyMapper mapper;

    @Override
    public List<InsuranceCompanyResponseDTO> findAll() {
        return insuranceCompanyRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<InsuranceCompanyResponseDTO> findById(Integer id) {
        return insuranceCompanyRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public InsuranceCompanyResponseDTO create(InsuranceCompanyRequestDTO dto) {
        InsuranceCompany company = mapper.toEntity(dto);
        return mapper.toDto(insuranceCompanyRepository.save(company));
    }

    @Override
    public Optional<InsuranceCompanyResponseDTO> update(Integer id, InsuranceCompanyRequestDTO dto) {
        return insuranceCompanyRepository.findById(id).map(existing -> {
            InsuranceCompany company = mapper.toEntity(dto);
            company.setId(existing.getId());
            return mapper.toDto(insuranceCompanyRepository.save(company));
        });
    }

    @Override
    public void deleteById(Integer id) {
        insuranceCompanyRepository.deleteById(id);
    }
}