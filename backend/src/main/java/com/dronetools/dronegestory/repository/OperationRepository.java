package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperationRepository extends JpaRepository<Operation, Integer> {
}