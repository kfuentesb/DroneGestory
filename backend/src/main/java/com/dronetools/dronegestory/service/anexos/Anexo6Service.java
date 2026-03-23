package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo6Service {
    private final Anexo6Repository anexo6Repository;
    private final OperationRepository operationRepository;

    public Anexo6Service(Anexo6Repository anexo6Repository, OperationRepository operationRepository) {
        this.anexo6Repository = anexo6Repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        Anexo6 actual = op.getAnexo6Actual();

        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            // Actualizamos los campos específicos del Anexo 6
            actual.setTextoPrueba(datosNuevos.getTextoPrueba());
            return anexo6Repository.save(actual);
        } else {
            // Creamos nueva versión usando el contador del Anexo 6
            datosNuevos.setOperation(op);
            datosNuevos.setNumeroVersion(op.getNextVersionAnexo6());
            datosNuevos.setEstado(AnexoStatus.BORRADOR);
            return anexo6Repository.save(datosNuevos);
        }
    }
}