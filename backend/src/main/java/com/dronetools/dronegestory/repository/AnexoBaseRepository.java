package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface AnexoBaseRepository<T extends Anexo, ID> extends JpaRepository<T, ID> {
    Optional<T> findByOperation(Operation operation);

    // Buscar todas las versiones de una operación (para histórico)
    List<T> findByOperationOrderByNumeroVersionDesc(Operation operation);

    // Buscar última versión (la de número más alto)
    @Query("SELECT a FROM #{#entityName} a WHERE a.operation = :operation ORDER BY a.numeroVersion DESC")
    Optional<T> findTopByOperationOrderByNumeroVersionDesc(@Param("operation") Operation operation);

    // Buscar versión en BORRADOR (solo debe haber 0 o 1)
    Optional<T> findByOperationAndEstado(Operation operation, AnexoStatus estado);

    // Contar versiones totales (para calcular siguiente versión)
    @Query("SELECT COALESCE(MAX(a.numeroVersion), 0) FROM #{#entityName} a WHERE a.operation = :operation")
    int findMaxNumeroVersionByOperation(@Param("operation") Operation operation);
}