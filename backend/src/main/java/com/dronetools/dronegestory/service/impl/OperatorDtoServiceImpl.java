package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.OperatorRequestDTO;
import com.dronetools.dronegestory.dto.response.OperatorResponseDTO;
import com.dronetools.dronegestory.mapper.OperatorMapper;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.repository.OperatorRepository;
import com.dronetools.dronegestory.service.OperatorDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperatorDtoServiceImpl implements OperatorDtoService {

    private final OperatorRepository operatorRepository;
    private final OperatorMapper mapper;

    @Override
    public List<OperatorResponseDTO> findAll() {
        return operatorRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<OperatorResponseDTO> findById(Integer id) {
        return operatorRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public OperatorResponseDTO create(OperatorRequestDTO dto) {
        Operator operator = mapper.toEntity(dto);
        return mapper.toDto(operatorRepository.save(operator));
    }

    @Override
    public Optional<OperatorResponseDTO> update(Integer id, OperatorRequestDTO dto) {
        return operatorRepository.findById(id).map(existing -> {
            Operator operator = mapper.toEntity(dto);
            operator.setId(existing.getId());
            return mapper.toDto(operatorRepository.save(operator));
        });
    }

    @Override
    public void deleteById(Integer id) {
        operatorRepository.deleteById(id);
    }
}