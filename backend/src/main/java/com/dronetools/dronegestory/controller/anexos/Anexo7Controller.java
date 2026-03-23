<<<<<<< HEAD:backend/src/main/java/com/dronetools/dronegestory/controller/Anexo7Controller.java
package com.dronetools.dronegestory.controller;
=======
// Anexo7Controller.java
package com.dronetools.dronegestory.controller.anexos;
>>>>>>> 2b8ea28fe6b695519ccd7f9cbe25010a3bae1dfe:backend/src/main/java/com/dronetools/dronegestory/controller/anexos/Anexo7Controller.java

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.anexos.Anexo7Service;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo7")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo7Controller {

    private final Anexo7Service anexo7Service;
    private final OperationRepository operationRepository;

    public Anexo7Controller(Anexo7Service anexo7Service, OperationRepository operationRepository) {
        this.anexo7Service = anexo7Service;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo7 saveOrUpdateAnexo5(@PathVariable Long operationId, @RequestBody Anexo7 input) {
        // El controlador ahora solo delega la responsabilidad al servicio
        return anexo7Service.registrarAnexo7(operationId, input);
    }

    @GetMapping("/actual")
    public Anexo7 getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return op.getAnexo7Actual();
    }
}