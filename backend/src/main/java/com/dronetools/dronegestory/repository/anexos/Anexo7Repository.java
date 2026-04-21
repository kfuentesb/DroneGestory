package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Anexo7Repository extends AnexoBaseRepository<Anexo7, Long> {
    Optional<Anexo7> findByOperationAndNumeroVersionAndAircraftId(Operation operation, int numeroVersion, Long aircraftId);
    
    List<Anexo7> findByOperationAndNumeroVersion(Operation operation, int numeroVersion);

    @Query("SELECT COALESCE(MAX(a.numeroVersion), 0) FROM Anexo7 a WHERE a.operation = :operation AND a.aircraftId = :aircraftId")
    int findMaxNumeroVersionByOperationAndAircraftId(@Param("operation") Operation operation,
                                                     @Param("aircraftId") Long aircraftId);
}
