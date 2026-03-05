package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.CertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.CertificationResponseDTO;

import java.util.List;
import java.util.Optional;

public interface CertificationDtoService {
    List<CertificationResponseDTO> findAll();
    Optional<CertificationResponseDTO> findById(Integer id);
    CertificationResponseDTO create(CertificationRequestDTO dto);
    Optional<CertificationResponseDTO> update(Integer id, CertificationRequestDTO dto);
    void deleteById(Integer id);
}