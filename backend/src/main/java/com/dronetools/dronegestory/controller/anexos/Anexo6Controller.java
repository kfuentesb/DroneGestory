// Anexo6Controller.java
package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.anexos.Anexo6Service;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo6")
public class Anexo6Controller {

    private final Anexo6Service anexo6Service;
    private final OperationRepository operationRepository;

    public Anexo6Controller(Anexo6Service anexo6Service, OperationRepository operationRepository) {
        this.anexo6Service = anexo6Service;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo6 saveOrUpdateAnexo5(@PathVariable Long operationId, @RequestBody Anexo6 input) {
        // El controlador ahora solo delega la responsabilidad al servicio
        return anexo6Service.registrarAnexo6(operationId, input);
    }

    @GetMapping("/actual")
    public Anexo6 getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return op.getAnexo6Actual();
    }
}
