package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Anexo6Repository extends AnexoBaseRepository<Anexo6, Long> {
    Optional<Anexo6> findByOperationAndNumeroVersionAndAircraftId(Operation operation, int numeroVersion, Long aircraftId);
    
    List<Anexo6> findByOperationAndNumeroVersion(Operation operation, int numeroVersion);

    @Query("SELECT COALESCE(MAX(a.numeroVersion), 0) FROM Anexo6 a WHERE a.operation = :operation AND a.aircraftId = :aircraftId")
    int findMaxNumeroVersionByOperationAndAircraftId(@Param("operation") Operation operation,
                                                     @Param("aircraftId") Long aircraftId);
}
