package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

@Service
public class Anexo4Service {
    private final Anexo4Repository anexo4Repository;
    private final OperationRepository operationRepository;

    public Anexo4Service(Anexo4Repository anexo4Repository, OperationRepository operationRepository) {
        this.anexo4Repository = anexo4Repository;
        this.operationRepository = operationRepository;
    }

    public Anexo4 save(Long operationId, String campoAnexo4) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo4 a4 = new Anexo4();
        a4.setCampoAnexo4(campoAnexo4);
        a4.setOperation(op);
        return anexo4Repository.save(a4);
    }

    public Anexo4 update(Long operationId, String campoAnexo4) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo4 existente = anexo4Repository.findByOperation(op)
                .orElse(new Anexo4());
        existente.setCampoAnexo4(campoAnexo4);
        existente.setOperation(op);
        return anexo4Repository.save(existente);
    }
}