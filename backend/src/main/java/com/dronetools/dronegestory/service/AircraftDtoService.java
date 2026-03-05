package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.AircraftRequestDTO;
import com.dronetools.dronegestory.dto.response.AircraftResponseDTO;

import java.util.List;
import java.util.Optional;

public interface AircraftDtoService {
    List<AircraftResponseDTO> findAll();
    Optional<AircraftResponseDTO> findById(Integer id);
    AircraftResponseDTO create(AircraftRequestDTO dto);
    Optional<AircraftResponseDTO> update(Integer id, AircraftRequestDTO dto);
    void deleteById(Integer id);
}