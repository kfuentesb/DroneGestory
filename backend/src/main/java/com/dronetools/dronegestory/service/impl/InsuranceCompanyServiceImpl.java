package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.InsuranceCompany;
import com.dronetools.dronegestory.repository.InsuranceCompanyRepository;
import com.dronetools.dronegestory.service.InsuranceCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InsuranceCompanyServiceImpl implements InsuranceCompanyService {

    private final InsuranceCompanyRepository repository;

    @Override
    public List<InsuranceCompany> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<InsuranceCompany> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public InsuranceCompany save(InsuranceCompany insuranceCompany) {
        return repository.save(insuranceCompany);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}