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

    @GetMapping
    public List<Operation> getAll(){
        return operationService.getAllOperations();
    }

    @PostMapping
    public Operation create(@RequestBody Operation op) {
        // Aquí solo pides los campos mínimos; si usas sólo nombre, basta.
        return operationService.saveOperation(op);
    }
}
