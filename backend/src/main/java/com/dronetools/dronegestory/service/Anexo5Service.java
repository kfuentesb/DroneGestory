package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.Anexo5Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

@Service
public class Anexo5Service {
    private final Anexo5Repository anexo5Repository;
    private final OperationRepository operationRepository;

    public Anexo5Service(Anexo5Repository anexo5Repository, OperationRepository operationRepository) {
        this.anexo5Repository = anexo5Repository;
        this.operationRepository = operationRepository;
    }

    public Anexo5 save(Long operationId, String campoAnexo5) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo5 a5 = new Anexo5();
        a5.setCampoAnexo5(campoAnexo5);
        a5.setOperation(op);
        return anexo5Repository.save(a5);
    }

    public Anexo5 update(Long operationId, String campoAnexo5) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        Anexo5 existente = anexo5Repository.findByOperation(op)
                .orElse(new Anexo5());
        existente.setCampoAnexo5(campoAnexo5);
        existente.setOperation(op);
        return anexo5Repository.save(existente);
    }
}