package com.dronetools.dronegestory.repository.anexos;


import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface Anexo5Repository extends AnexoBaseRepository<Anexo5, Long> {
    @Query("""
        SELECT DISTINCT a
        FROM Anexo5 a
        LEFT JOIN FETCH a.firmasAptitud f
        LEFT JOIN FETCH f.firmante
        WHERE a.id = :id
    """)
    Optional<Anexo5> findByIdWithFirmas(@Param("id") Long id);
}
