package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorRepository extends JpaRepository<Operator, Integer> {
}