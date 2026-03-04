package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operator;
import java.util.List;
import java.util.Optional;

public interface OperatorService {
    List<Operator> findAll();
    Optional<Operator> findById(Integer id);
    Operator save(Operator operator);
    void deleteById(Integer id);
}