package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;

import java.util.Collection;
import java.util.Optional;

public interface Anexo6Repository extends AnexoBaseRepository<Anexo6, Long> {
    Optional<Anexo6> findFirstByOperationAndSerialAeronaveOrderByNumeroVersionDesc(Operation operation, String serialAeronave);
    void deleteByOperationAndSerialAeronaveIn(Operation operation, Collection<String> seriales);
}
