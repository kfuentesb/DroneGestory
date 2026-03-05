package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.Certification;
import com.dronetools.dronegestory.repository.CertificationRepository;
import com.dronetools.dronegestory.service.CertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificationServiceImpl implements CertificationService {

    private final CertificationRepository repository;

    @Override
    public List<Certification> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Certification> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Certification save(Certification certification) {
        return repository.save(certification);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}