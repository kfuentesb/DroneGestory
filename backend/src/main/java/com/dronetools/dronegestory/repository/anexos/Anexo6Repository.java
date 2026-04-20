package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;

import java.util.List;
import java.util.Optional;

public interface Anexo6Repository extends AnexoBaseRepository<Anexo6, Long> {
    Optional<Anexo6> findFirstByOperationAndSerialAeronaveIgnoreCaseOrderByNumeroVersionDesc(
            Operation operation,
            String serialAeronave
    );
    Optional<Anexo6> findFirstByOperationAndNumeroVersionAndSerialAeronaveIgnoreCase(
            Operation operation,
            int numeroVersion,
            String serialAeronave
    );
    List<Anexo6> findByOperationAndNumeroVersion(Operation operation, int numeroVersion);
}
