package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.OperationRequestDTO;
import com.dronetools.dronegestory.dto.response.OperationResponseDTO;

import java.util.List;
import java.util.Optional;

public interface OperationDtoService {
    List<OperationResponseDTO> findAll();
    Optional<OperationResponseDTO> findById(Integer id);
    OperationResponseDTO create(OperationRequestDTO dto);
    Optional<OperationResponseDTO> update(Integer id, OperationRequestDTO dto);
    void deleteById(Integer id);
}