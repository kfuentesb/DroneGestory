// Anexo7Controller.java
package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo7")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo7Controller {

    private final Anexo7Repository anexo7Repository;
    private final OperationRepository operationRepository;

    public Anexo7Controller(Anexo7Repository anexo7Repository, OperationRepository operationRepository) {
        this.anexo7Repository = anexo7Repository;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo7 saveAnexo7(@PathVariable Long operationId, @ModelAttribute Anexo7 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        input.setOperation(op);
        return anexo7Repository.save(input);
    }

    @PutMapping
    public Anexo7 updateAnexo7(@PathVariable Long operationId, @ModelAttribute Anexo7 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo7 existente = anexo7Repository.findByOperation(op)
                .orElse(new Anexo7());
        existente.setCampoAnexo7(input.getCampoAnexo7());
        existente.setOperation(op);
        return anexo7Repository.save(existente);
    }
}