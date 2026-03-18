package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Anexo6Repository extends JpaRepository<Anexo6, Integer> {
    Optional<Anexo6> findByOperation(Operation operation);
}
