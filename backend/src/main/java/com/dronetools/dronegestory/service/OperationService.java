package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OperationService {

    private final OperationRepository operationRepository;

    public OperationService(OperationRepository operationRepository) {
        this.operationRepository = operationRepository;
    }

    @Transactional(readOnly = true)
    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Operation> findOperationsByUserId(Integer userId) {
        return operationRepository.findByCreadorId(userId);
    }

    @Transactional
    public Operation saveOperation(Operation op) {
        return operationRepository.save(op);
    }

    @Transactional
    public Operation updateOperation(Long operationId, Operation opActualizada) {
        Operation op = findById(operationId);
        op.setNombreOperacion(opActualizada.getNombreOperacion());
        return operationRepository.save(op);
    }

    @Transactional(readOnly = true)
    public Operation findById(Long operationId) {
        return operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
    }

    @Transactional
    public void deleteOperation(Long operationId) {
        operationRepository.deleteById(operationId);
    }

    @Transactional
    public Operation updateOperationBasicData(Long operationId, String nuevoNombre) {
        Operation op = findById(operationId);
        op.setNombreOperacion(nuevoNombre);
        return operationRepository.save(op);
    }

    @Transactional
    public Operation completarOperation(Long operationId) {
        Operation op = findById(operationId);
        if (!op.todosAnexosFirmados()) {
            throw new RuntimeException("No se puede completar la operación sin todos los anexos firmados");
        }
        op.setEstado(OperationStatus.COMPLETADA);
        return operationRepository.save(op);
    }
}
