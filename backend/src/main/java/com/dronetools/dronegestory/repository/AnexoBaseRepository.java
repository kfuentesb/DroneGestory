package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Optional;

@NoRepositoryBean
public interface AnexoBaseRepository<T extends Anexo, ID> extends JpaRepository<T, ID> {
    Optional<T> findByOperation(Operation operation);
}