package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.OperationRequestDTO;
import com.dronetools.dronegestory.dto.response.OperationResponseDTO;
import com.dronetools.dronegestory.mapper.OperationMapper;
import com.dronetools.dronegestory.model.Aircraft;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.PilotRepository;
import com.dronetools.dronegestory.service.OperationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperationDtoServiceImpl implements OperationDtoService {

    private final OperationRepository operationRepository;
    private final PilotRepository pilotRepository;
    private final AircraftRepository aircraftRepository;
    private final OperationMapper mapper;

    @Override
    public List<OperationResponseDTO> findAll() {
        return operationRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<OperationResponseDTO> findById(Integer id) {
        return operationRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public OperationResponseDTO create(OperationRequestDTO dto) {
        Pilot pilot = pilotRepository.findById(dto.getPilotId())
                .orElseThrow(() -> new RuntimeException("Pilot not found"));
        Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                .orElseThrow(() -> new RuntimeException("Aircraft not found"));

        Operation operation = mapper.toEntity(dto, pilot, aircraft);
        return mapper.toDto(operationRepository.save(operation));
    }

    @Override
    public Optional<OperationResponseDTO> update(Integer id, OperationRequestDTO dto) {
        return operationRepository.findById(id).map(existing -> {
            Pilot pilot = pilotRepository.findById(dto.getPilotId())
                    .orElseThrow(() -> new RuntimeException("Pilot not found"));
            Aircraft aircraft = aircraftRepository.findById(dto.getAircraftId())
                    .orElseThrow(() -> new RuntimeException("Aircraft not found"));

            Operation operation = mapper.toEntity(dto, pilot, aircraft);
            operation.setId(existing.getId());
            return mapper.toDto(operationRepository.save(operation));
        });
    }

    @Override
    public void deleteById(Integer id) {
        operationRepository.deleteById(id);
    }
}