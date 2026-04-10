package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationRepository extends JpaRepository<Operation, Long> {
    // @Query("SELECT o FROM Operation o JOIN FETCH o.creador WHERE o.creador.id = :userId")
    List<Operation> findByCreadorId(Integer userId);

    @Query("SELECT o FROM Operation o LEFT JOIN FETCH o.anexos4 WHERE o.idOperacion = :id")
    Optional<Operation> findByIdWithAnexos(@Param("id") Long id);
}
