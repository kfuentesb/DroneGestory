// Anexo8Controller.java
package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.anexos.Anexo8Service;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo8")
public class Anexo8Controller {

    private final Anexo8Service anexo8Service;
    private final OperationRepository operationRepository;

    public Anexo8Controller(Anexo8Service anexo8Service, OperationRepository operationRepository) {
        this.anexo8Service = anexo8Service;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo8 saveOrUpdateAnexo5(@PathVariable Long operationId, @RequestBody Anexo8 input) {
        // El controlador ahora solo delega la responsabilidad al servicio
        return anexo8Service.registrarAnexo8(operationId, input);
    }

    @GetMapping("/actual")
    public Anexo8 getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return op.getAnexo8Actual();
    }
}
