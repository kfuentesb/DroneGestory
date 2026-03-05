package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.repository.OperatorRepository;
import com.dronetools.dronegestory.service.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperatorServiceImpl implements OperatorService {

    private final OperatorRepository repository;

    @Override
    public List<Operator> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Operator> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Operator save(Operator operator) {
        return repository.save(operator);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}