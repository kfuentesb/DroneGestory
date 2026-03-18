package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Anexo8Repository extends JpaRepository<Anexo8, Integer> {
    Optional<Anexo8> findByOperation(Operation operation);
}
