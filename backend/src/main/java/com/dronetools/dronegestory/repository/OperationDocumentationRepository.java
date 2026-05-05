package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.OperationDocumentation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationDocumentationRepository extends JpaRepository<OperationDocumentation, Long> {

    @EntityGraph(attributePaths = "versions")
    List<OperationDocumentation> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = "versions")
    Optional<OperationDocumentation> findWithVersionsById(Long id);
}
