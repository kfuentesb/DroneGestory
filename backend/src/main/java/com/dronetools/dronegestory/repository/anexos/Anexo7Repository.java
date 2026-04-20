package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;

import java.util.Collection;
import java.util.Optional;

public interface Anexo7Repository extends AnexoBaseRepository<Anexo7, Long> {
    Optional<Anexo7> findFirstByOperationAndSerialAeronaveOrderByNumeroVersionDesc(Operation operation, String serialAeronave);
    void deleteByOperationAndSerialAeronaveIn(Operation operation, Collection<String> seriales);
}
