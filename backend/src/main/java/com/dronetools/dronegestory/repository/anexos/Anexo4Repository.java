package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface Anexo4Repository extends AnexoBaseRepository<Anexo4, Long> {
    @Query("""
        SELECT DISTINCT a
        FROM Anexo4 a
        LEFT JOIN FETCH a.personalSeleccionado
        WHERE a.id = :id
    """)
    Optional<Anexo4> findByIdWithPersonalSeleccionado(@Param("id") Long id);
}
