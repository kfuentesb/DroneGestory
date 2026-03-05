package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.PilotCertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotCertificationResponseDTO;
import com.dronetools.dronegestory.model.PilotCertificationId;

import java.util.List;
import java.util.Optional;

public interface PilotCertificationDtoService {
    List<PilotCertificationResponseDTO> findAll();
    Optional<PilotCertificationResponseDTO> findById(PilotCertificationId id);
    PilotCertificationResponseDTO create(PilotCertificationRequestDTO dto);
    void deleteById(PilotCertificationId id);
}