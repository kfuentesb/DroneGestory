// Anexo7Service.java
package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

@Service
public class Anexo7Service {
    private final Anexo7Repository anexo7Repository;
    private final OperationRepository operationRepository;

    public Anexo7Service(Anexo7Repository anexo7Repository, OperationRepository operationRepository) {
        this.anexo7Repository = anexo7Repository;
        this.operationRepository = operationRepository;
    }

    public Anexo7 save(Long operationId, String campoAnexo7) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo7 a7 = new Anexo7();
        a7.setCampoAnexo7(campoAnexo7);
        a7.setOperation(op);
        return anexo7Repository.save(a7);
    }

    public Anexo7 update(Long operationId, String campoAnexo7) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo7 existente = anexo7Repository.findByOperation(op)
                .orElse(new Anexo7());
        existente.setCampoAnexo7(campoAnexo7);
        existente.setOperation(op);
        return anexo7Repository.save(existente);
    }
}