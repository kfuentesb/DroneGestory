package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.InsuranceCompany;
import java.util.List;
import java.util.Optional;

public interface InsuranceCompanyService {
    List<InsuranceCompany> findAll();
    Optional<InsuranceCompany> findById(Integer id);
    InsuranceCompany save(InsuranceCompany insuranceCompany);
    void deleteById(Integer id);
}