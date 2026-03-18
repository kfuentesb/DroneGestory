package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Anexo4Repository extends JpaRepository<Anexo4, Long> {
    Optional<Anexo4> findByOperation(Operation operation);
}
