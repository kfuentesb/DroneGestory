package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.PilotRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotResponseDTO;

import java.util.List;
import java.util.Optional;

public interface PilotDtoService {
    List<PilotResponseDTO> findAll();
    Optional<PilotResponseDTO> findById(Integer id);
    PilotResponseDTO create(PilotRequestDTO dto);
    Optional<PilotResponseDTO> update(Integer id, PilotRequestDTO dto);
    void deleteById(Integer id);
}