package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.AircraftRequestDTO;
import com.dronetools.dronegestory.dto.response.AircraftResponseDTO;
import com.dronetools.dronegestory.mapper.AircraftMapper;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.InsuranceCompany;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.InsuranceCompanyRepository;
import com.dronetools.dronegestory.repository.OperatorRepository;
import com.dronetools.dronegestory.service.AircraftDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AircraftDtoServiceImpl implements AircraftDtoService {

    private final AircraftRepository aircraftRepository;
    private final OperatorRepository operatorRepository;
    private final InsuranceCompanyRepository insuranceCompanyRepository;
    private final AircraftMapper mapper;

    @Override
    public List<AircraftResponseDTO> findAll() {
        return aircraftRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<AircraftResponseDTO> findById(Integer id) {
        return aircraftRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public AircraftResponseDTO create(AircraftRequestDTO dto) {
        Operator operator = operatorRepository.findById(dto.getOperatorId())
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        InsuranceCompany insurance = insuranceCompanyRepository.findById(dto.getInsuranceCompanyId())
                .orElseThrow(() -> new RuntimeException("Insurance company not found"));

        Aircraft aircraft = mapper.toEntity(dto, operator, insurance);
        return mapper.toDto(aircraftRepository.save(aircraft));
    }

    @Override
    public Optional<AircraftResponseDTO> update(Integer id, AircraftRequestDTO dto) {
        return aircraftRepository.findById(id).map(existing -> {
            Operator operator = operatorRepository.findById(dto.getOperatorId())
                    .orElseThrow(() -> new RuntimeException("Operator not found"));
            InsuranceCompany insurance = insuranceCompanyRepository.findById(dto.getInsuranceCompanyId())
                    .orElseThrow(() -> new RuntimeException("Insurance company not found"));

            Aircraft aircraft = mapper.toEntity(dto, operator, insurance);
            aircraft.setId(existing.getId());
            return mapper.toDto(aircraftRepository.save(aircraft));
        });
    }

    @Override
    public void deleteById(Integer id) {
        aircraftRepository.deleteById(id);
    }
}