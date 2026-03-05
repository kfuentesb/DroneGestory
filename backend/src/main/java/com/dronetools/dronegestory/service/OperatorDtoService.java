package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.OperatorRequestDTO;
import com.dronetools.dronegestory.dto.response.OperatorResponseDTO;

import java.util.List;
import java.util.Optional;

public interface OperatorDtoService {
    List<OperatorResponseDTO> findAll();
    Optional<OperatorResponseDTO> findById(Integer id);
    OperatorResponseDTO create(OperatorRequestDTO dto);
    Optional<OperatorResponseDTO> update(Integer id, OperatorRequestDTO dto);
    void deleteById(Integer id);
}