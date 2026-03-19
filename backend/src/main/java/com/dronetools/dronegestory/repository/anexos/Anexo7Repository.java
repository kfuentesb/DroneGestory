package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Anexo7Repository extends JpaRepository<Anexo7, Integer> {
    Optional<Anexo7> findByOperation(Operation operation);
}
