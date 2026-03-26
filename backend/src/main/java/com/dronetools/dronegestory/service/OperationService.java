package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;

    public OperationService(OperationRepository operationRepository) {
        this.operationRepository = operationRepository;
    }

    // LISTA: todas las operaciones
    @Transactional
    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    // LISTA: por usuario
    @Transactional(readOnly = true)
    public List<Operation> findOperationsByUserId(Integer userId) {
        return operationRepository.findByCreadorId(userId);
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

    public List<Operation> findOperationsByUserId(Integer userId) {
        return operationRepository.findByCreadorId(userId);
    }

    // Actualizar solo datos básicos (nombre), no estado ni anexos
    Operation updateOperationBasicData(Long operationId, String nuevoNombre);

    // Completar operación (verifica que todos anexos estén firmados)
    Operation completarOperation(Long operationId);
}

