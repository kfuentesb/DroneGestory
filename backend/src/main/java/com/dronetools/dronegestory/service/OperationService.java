package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;

    public OperationService(OperationRepository operationRepository) {
        this.operationRepository = operationRepository;
    }

    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    public Operation saveOperation(Operation op) {
        // Guarda una nueva operación o actualiza (según si el ID está presente)
        return operationRepository.save(op);
    }

    public Operation updateOperation(Long operationId, Operation opActualizada) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        op.setNombreOperacion(opActualizada.getNombreOperacion());
        // Añade aquí otros campos editables en el futuro
        return operationRepository.save(op);
    }

    public Operation findById(Long operationId) {
        return operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
    }

    public void deleteOperation(Long operationId) {
        operationRepository.deleteById(operationId);
    }
}

