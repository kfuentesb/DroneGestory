package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo4")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo4Controller {

    private final Anexo4Repository anexo4Repository;
    private final OperationRepository operationRepository;

    public Anexo4Controller(Anexo4Repository anexo4Repository, OperationRepository operationRepository) {
        this.anexo4Repository = anexo4Repository;
        this.operationRepository = operationRepository;
    }

    // GUARDAR (create/update anexo4 for an operation - idempotente)
    @PostMapping
    public Anexo4 saveAnexo4(@PathVariable Long operationId, @ModelAttribute Anexo4 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        input.setOperation(op);
        // aquí puedes elegir si hacer update si ya existe (búsqueda previa) o siempre crear uno nuevo
        return anexo4Repository.save(input);
    }

    // OPCIONAL: Si quieres guardar “avances” parciales, puedes hacer un PUT que actualice lo existente:
    @PutMapping
    public Anexo4 updateAnexo4(@PathVariable Long operationId, @ModelAttribute Anexo4 input) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo4 existente = anexo4Repository.findByOperation(op)
                .orElse(new Anexo4());
        existente.setCampoAnexo4(input.getCampoAnexo4());
        existente.setOperation(op);
        return anexo4Repository.save(existente);
    }
}