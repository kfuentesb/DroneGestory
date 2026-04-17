package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Operation;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationRepository extends JpaRepository<Operation, Long> {
    // @Query("SELECT o FROM Operation o JOIN FETCH o.creador WHERE o.creador.id = :userId")
    List<Operation> findByCreadorId(Integer userId);

    @Query("""
        SELECT MAX(o.correlativoAnual)
        FROM Operation o
        WHERE o.anioCorrelativo = :anio
    """)
    Integer findMaxCorrelativoByAnio(@Param("anio") int anio);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT o.correlativoAnual
        FROM Operation o
        WHERE o.anioCorrelativo = :anio
        ORDER BY o.correlativoAnual DESC
    """)
    List<Integer> findTopCorrelativoByAnioForUpdate(@Param("anio") int anio, Pageable pageable);

    @Query("""
        SELECT o
        FROM Operation o
        LEFT JOIN FETCH o.anexos4
        WHERE o.idOperacion = :id
    """)
    Optional<Operation> findByIdWithAnexos4(@Param("id") Long id);

    // SOLO FETCH ANEXOS5
    @Query("""
        SELECT o
        FROM Operation o
        LEFT JOIN FETCH o.anexos5
        WHERE o.idOperacion = :id
    """)
    Optional<Operation> findByIdWithAnexos5(@Param("id") Long id);

    // SOLO FETCH ANEXOS6
    @Query("""
        SELECT o
        FROM Operation o
        LEFT JOIN FETCH o.anexos6
        WHERE o.idOperacion = :id
    """)
    Optional<Operation> findByIdWithAnexos6(@Param("id") Long id);

    // SOLO FETCH ANEXOS7
    @Query("""
        SELECT o
        FROM Operation o
        LEFT JOIN FETCH o.anexos7
        WHERE o.idOperacion = :id
    """)
    Optional<Operation> findByIdWithAnexos7(@Param("id") Long id);

    // SOLO FETCH ANEXOS8
    @Query("""
        SELECT o
        FROM Operation o
        LEFT JOIN FETCH o.anexos8
        WHERE o.idOperacion = :id
    """)
    Optional<Operation> findByIdWithAnexos8(@Param("id") Long id);
}
