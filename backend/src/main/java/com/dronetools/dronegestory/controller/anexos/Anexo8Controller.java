// Anexo8Controller.java
package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo8Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo8")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo8Controller {

    private final Anexo8Repository anexo8Repository;
    private final OperationRepository operationRepository;

    public Anexo8Controller(Anexo8Repository anexo8Repository, OperationRepository operationRepository) {
        this.anexo8Repository = anexo8Repository;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo8 saveAnexo8(@PathVariable Long operationId, @ModelAttribute Anexo8 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        input.setOperation(op);
        return anexo8Repository.save(input);
    }

    @PutMapping
    public Anexo8 updateAnexo8(@PathVariable Long operationId, @ModelAttribute Anexo8 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo8 existente = anexo8Repository.findByOperation(op)
                .orElse(new Anexo8());
        existente.setCampoAnexo8(input.getCampoAnexo8());
        existente.setOperation(op);
        return anexo8Repository.save(existente);
    }
}