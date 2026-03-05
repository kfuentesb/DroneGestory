package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.PilotRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotResponseDTO;
import com.dronetools.dronegestory.mapper.PilotMapper;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.repository.OperatorRepository;
import com.dronetools.dronegestory.repository.PilotRepository;
import com.dronetools.dronegestory.service.PilotDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PilotDtoServiceImpl implements PilotDtoService {

    private final PilotRepository pilotRepository;
    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final PilotMapper mapper;

    @Override
    public List<PilotResponseDTO> findAll() {
        return pilotRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<PilotResponseDTO> findById(Integer id) {
        return pilotRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public PilotResponseDTO create(PilotRequestDTO dto) {
        Operator operator = operatorRepository.findById(dto.getOperatorId())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        Pilot pilot = mapper.toEntity(dto, operator, passwordEncoder.encode(dto.getPassword()));
        return mapper.toDto(pilotRepository.save(pilot));
    }

    @Override
    public Optional<PilotResponseDTO> update(Integer id, PilotRequestDTO dto) {
        return pilotRepository.findById(id).map(existing -> {
            Operator operator = operatorRepository.findById(dto.getOperatorId())
                    .orElseThrow(() -> new RuntimeException("Operator not found"));

            Pilot pilot = mapper.toEntity(dto, operator, passwordEncoder.encode(dto.getPassword()));
            pilot.setId(existing.getId());
            return mapper.toDto(pilotRepository.save(pilot));
        });
    }

    @Override
    public void deleteById(Integer id) {
        pilotRepository.deleteById(id);
    }
}