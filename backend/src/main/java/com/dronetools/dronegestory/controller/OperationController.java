package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.OperationDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.service.OperationService;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService operationService;
    private final UserService userService;

    // Obtener todas las operaciones
    @GetMapping
    public List<Operation> getAll() {
        return operationService.getAllOperations();
    }

    // Crear una nueva operación
//    @PostMapping
//    public Operation create(@ModelAttribute Operation op) {
//        return operationService.saveOperation(op);
//    }

    @PostMapping
    public OperationDTO create(@ModelAttribute Operation op, Principal principal) {
        User user = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        op.setCreador(user);
        Operation savedOp = operationService.saveOperation(op);
        return new OperationDTO(savedOp);
    }

    // Actualizar una operación existente
    @PutMapping("/{operationId}")
    public Operation update(@PathVariable Long operationId, @ModelAttribute Operation op) {
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
