package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Certification;
import java.util.List;
import java.util.Optional;

public interface CertificationService {
    List<Certification> findAll();
    Optional<Certification> findById(Integer id);
    Certification save(Certification certification);
    void deleteById(Integer id);
}