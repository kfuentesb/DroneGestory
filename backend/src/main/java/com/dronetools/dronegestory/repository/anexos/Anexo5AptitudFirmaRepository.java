package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo5AptitudFirma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Anexo5AptitudFirmaRepository extends JpaRepository<Anexo5AptitudFirma, Long> {
    List<Anexo5AptitudFirma> findByAnexo5IdOrderByFechaFirmaAsc(Long anexo5Id);
    Optional<Anexo5AptitudFirma> findByAnexo5IdAndFirmanteId(Long anexo5Id, Integer firmanteId);
    Optional<Anexo5AptitudFirma> findByIdAndAnexo5Id(Long id, Long anexo5Id);
}
