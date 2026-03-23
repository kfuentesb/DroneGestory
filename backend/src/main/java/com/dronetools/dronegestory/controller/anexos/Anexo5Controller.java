<<<<<<< HEAD:backend/src/main/java/com/dronetools/dronegestory/controller/Anexo5Controller.java
package com.dronetools.dronegestory.controller;
=======
// Anexo5Controller.java
package com.dronetools.dronegestory.controller.anexos;
>>>>>>> 2b8ea28fe6b695519ccd7f9cbe25010a3bae1dfe:backend/src/main/java/com/dronetools/dronegestory/controller/anexos/Anexo5Controller.java

import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.anexos.Anexo5Service; // Importamos el servicio
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo5")
@CrossOrigin(origins = "http://localhost:5173")
public class Anexo5Controller {

    private final Anexo5Service anexo5Service; // Usamos el servicio en lugar del repositorio directamente
    private final OperationRepository operationRepository;

    public Anexo5Controller(Anexo5Service anexo5Service, OperationRepository operationRepository) {
        this.anexo5Service = anexo5Service;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo5 saveOrUpdateAnexo5(@PathVariable Long operationId, @RequestBody Anexo5 input) {
        // El controlador ahora solo delega la responsabilidad al servicio
        return anexo5Service.registrarAnexo5(operationId, input);
    }

    @GetMapping("/actual")
    public Anexo5 getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return op.getAnexo5Actual();
    }
}