package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo5Service {
    private final Anexo5Repository anexo5Repository;
    private final OperationRepository operationRepository;

    public Anexo5Service(Anexo5Repository anexo5Repository, OperationRepository operationRepository) {
        this.anexo5Repository = anexo5Repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        Anexo5 actual = op.getAnexo5Actual();

        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            // Actualizamos los campos específicos del Anexo 5
            actual.setTextoPrueba(datosNuevos.getTextoPrueba());
            return anexo5Repository.save(actual);
        } else {
            // Creamos nueva versión usando el contador del Anexo 5
            datosNuevos.setOperation(op);
            datosNuevos.setNumeroVersion(op.getNextVersionAnexo5());
            datosNuevos.setEstado(AnexoStatus.BORRADOR);
            return anexo5Repository.save(datosNuevos);
        }
    }
}