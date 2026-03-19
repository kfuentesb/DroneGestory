// Anexo6Controller.java
package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo6")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo6Controller {

    private final Anexo6Repository anexo6Repository;
    private final OperationRepository operationRepository;

    public Anexo6Controller(Anexo6Repository anexo6Repository, OperationRepository operationRepository) {
        this.anexo6Repository = anexo6Repository;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo6 saveAnexo6(@PathVariable Long operationId, @ModelAttribute Anexo6 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        input.setOperation(op);
        return anexo6Repository.save(input);
    }

    @PutMapping
    public Anexo6 updateAnexo6(@PathVariable Long operationId, @ModelAttribute Anexo6 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo6 existente = anexo6Repository.findByOperation(op)
                .orElse(new Anexo6());
        existente.setCampoAnexo6(input.getCampoAnexo6());
        existente.setOperation(op);
        return anexo6Repository.save(existente);
    }
}