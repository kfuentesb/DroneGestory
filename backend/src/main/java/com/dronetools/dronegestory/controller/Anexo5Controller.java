// Anexo5Controller.java
package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.Anexo5Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo5")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo5Controller {

    private final Anexo5Repository anexo5Repository;
    private final OperationRepository operationRepository;

    public Anexo5Controller(Anexo5Repository anexo5Repository, OperationRepository operationRepository) {
        this.anexo5Repository = anexo5Repository;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo5 saveAnexo5(@PathVariable Long operationId, @ModelAttribute Anexo5 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        input.setOperation(op);
        return anexo5Repository.save(input);
    }

    @PutMapping
    public Anexo5 updateAnexo5(@PathVariable Long operationId, @ModelAttribute Anexo5 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo5 existente = anexo5Repository.findByOperation(op)
                .orElse(new Anexo5());
        existente.setCampoAnexo5(input.getCampoAnexo5());
        existente.setOperation(op);
        return anexo5Repository.save(existente);
    }
}