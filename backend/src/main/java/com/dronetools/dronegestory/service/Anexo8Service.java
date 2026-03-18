// Anexo8Service.java
package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.Anexo8Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

@Service
public class Anexo8Service {
    private final Anexo8Repository anexo8Repository;
    private final OperationRepository operationRepository;

    public Anexo8Service(Anexo8Repository anexo8Repository, OperationRepository operationRepository) {
        this.anexo8Repository = anexo8Repository;
        this.operationRepository = operationRepository;
    }

    public Anexo8 save(Long operationId, String campoAnexo8) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo8 a8 = new Anexo8();
        a8.setCampoAnexo8(campoAnexo8);
        a8.setOperation(op);
        return anexo8Repository.save(a8);
    }

    public Anexo8 update(Long operationId, String campoAnexo8) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo8 existente = anexo8Repository.findByOperation(op)
                .orElse(new Anexo8());
        existente.setCampoAnexo8(campoAnexo8);
        existente.setOperation(op);
        return anexo8Repository.save(existente);
    }
}