package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo7Service {
    private final Anexo7Repository anexo7Repository;
    private final OperationRepository operationRepository;

    public Anexo7Service(Anexo7Repository anexo7Repository, OperationRepository operationRepository) {
        this.anexo7Repository = anexo7Repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public Anexo7 registrarAnexo7(Long operationId, Anexo7 datosNuevos) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        Anexo7 actual = op.getAnexo7Actual();

        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            // Actualizamos los campos específicos del Anexo 7
            actual.setTextoPrueba(datosNuevos.getTextoPrueba());
            return anexo7Repository.save(actual);
        } else {
            // Creamos nueva versión usando el contador del Anexo 7
            datosNuevos.setOperation(op);
            datosNuevos.setNumeroVersion(op.getNextVersionAnexo7());
            datosNuevos.setEstado(AnexoStatus.BORRADOR);
            return anexo7Repository.save(datosNuevos);
        }
    }
}