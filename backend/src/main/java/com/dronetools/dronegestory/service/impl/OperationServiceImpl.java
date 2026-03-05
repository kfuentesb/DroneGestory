package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperationServiceImpl implements OperationService {

    private final OperationRepository repository;

    @Override
    public List<Operation> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Operation> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Operation save(Operation operation) {
        return repository.save(operation);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}