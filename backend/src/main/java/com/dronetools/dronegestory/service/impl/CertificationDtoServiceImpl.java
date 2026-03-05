package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.CertificationRequestDTO;
import com.dronetools.dronegestory.dto.response.CertificationResponseDTO;
import com.dronetools.dronegestory.mapper.CertificationMapper;
import com.dronetools.dronegestory.model.Certification;
import com.dronetools.dronegestory.repository.CertificationRepository;
import com.dronetools.dronegestory.service.CertificationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificationDtoServiceImpl implements CertificationDtoService {

    private final CertificationRepository certificationRepository;
    private final CertificationMapper mapper;

    @Override
    public List<CertificationResponseDTO> findAll() {
        return certificationRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<CertificationResponseDTO> findById(Integer id) {
        return certificationRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public CertificationResponseDTO create(CertificationRequestDTO dto) {
        Certification certification = mapper.toEntity(dto);
        return mapper.toDto(certificationRepository.save(certification));
    }

    @Override
    public Optional<CertificationResponseDTO> update(Integer id, CertificationRequestDTO dto) {
        return certificationRepository.findById(id).map(existing -> {
            Certification certification = mapper.toEntity(dto);
            certification.setId(existing.getId());
            return mapper.toDto(certificationRepository.save(certification));
        });
    }

    @Override
    public void deleteById(Integer id) {
        certificationRepository.deleteById(id);
    }
}