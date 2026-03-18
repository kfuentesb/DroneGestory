// Anexo6Service.java
package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

@Service
public class Anexo6Service {
    private final Anexo6Repository anexo6Repository;
    private final OperationRepository operationRepository;

    public Anexo6Service(Anexo6Repository anexo6Repository, OperationRepository operationRepository) {
        this.anexo6Repository = anexo6Repository;
        this.operationRepository = operationRepository;
    }

    public Anexo6 save(Long operationId, String campoAnexo6) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo6 a6 = new Anexo6();
        a6.setCampoAnexo6(campoAnexo6);
        a6.setOperation(op);
        return anexo6Repository.save(a6);
    }

    public Anexo6 update(Long operationId, String campoAnexo6) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo6 existente = anexo6Repository.findByOperation(op)
                .orElse(new Anexo6());
        existente.setCampoAnexo6(campoAnexo6);
        existente.setOperation(op);
        return anexo6Repository.save(existente);
    }
}