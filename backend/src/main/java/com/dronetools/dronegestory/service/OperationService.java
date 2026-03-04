package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import java.util.List;
import java.util.Optional;

public interface OperationService {
    List<Operation> findAll();
    Optional<Operation> findById(Integer id);
    Operation save(Operation operation);
    void deleteById(Integer id);
}