package com.dronetools.dronegestory.repository.anexos;


import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Anexo5Repository extends JpaRepository<Anexo5, Long> {
    Optional<Anexo5> findByOperation(Operation operation);
}
