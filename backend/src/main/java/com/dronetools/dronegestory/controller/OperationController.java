package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/operations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OperationController {

    private final OperationService operationService;

    // Obtener todas las operaciones
    @GetMapping
    public List<Operation> getAll() {
        return operationService.getAllOperations();
    }

    // Crear una nueva operación
    @PostMapping
    public Operation create(@RequestBody Operation op) {
        return operationService.saveOperation(op);
    }

    // Actualizar una operación existente
    @PutMapping("/{operationId}")
    public Operation update(@PathVariable Long operationId, @RequestBody Operation op) {
        return operationService.updateOperation(operationId, op);
    }

    // Obtener una operación por su ID
    @GetMapping("/{operationId}")
    public Operation getById(@PathVariable Long operationId) {
        return operationService.findById(operationId);
    }

    // Borrar una operación
    @DeleteMapping("/{operationId}")
    public void delete(@PathVariable Long operationId) {
        operationService.deleteOperation(operationId);
    }
}