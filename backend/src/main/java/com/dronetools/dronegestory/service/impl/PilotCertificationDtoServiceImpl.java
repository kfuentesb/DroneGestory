package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.PilotCertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.PilotCertificationResponseDTO;
import com.dronetools.dronegestory.mapper.PilotCertificationMapper;
import com.dronetools.dronegestory.model.Certification;
import com.dronetools.dronegestory.model.Pilot;
import com.dronetools.dronegestory.model.PilotCertification;
import com.dronetools.dronegestory.model.PilotCertificationId;
import com.dronetools.dronegestory.repository.CertificationRepository;
import com.dronetools.dronegestory.repository.PilotCertificationRepository;
import com.dronetools.dronegestory.repository.PilotRepository;
import com.dronetools.dronegestory.service.PilotCertificationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PilotCertificationDtoServiceImpl implements PilotCertificationDtoService {

    private final PilotCertificationRepository pilotCertificationRepository;
    private final PilotRepository pilotRepository;
    private final CertificationRepository certificationRepository;
    private final PilotCertificationMapper mapper;

    @Override
    public List<PilotCertificationResponseDTO> findAll() {
        return pilotCertificationRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<PilotCertificationResponseDTO> findById(PilotCertificationId id) {
        return pilotCertificationRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public PilotCertificationResponseDTO create(PilotCertificationRequestDTO dto) {
        Pilot pilot = pilotRepository.findById(dto.getPilotId())
                .orElseThrow(() -> new RuntimeException("Pilot not found"));
        Certification certification = certificationRepository.findById(dto.getCertificationId())
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        PilotCertification pc = mapper.toEntity(dto, pilot, certification);
        return mapper.toDto(pilotCertificationRepository.save(pc));
    }

    @Override
    public void deleteById(PilotCertificationId id) {
        pilotCertificationRepository.deleteById(id);
    }
}