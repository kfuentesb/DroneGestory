package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.service.anexos.Anexo4Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo4")
@CrossOrigin(origins = "*")
public class Anexo4Controller extends AnexoControllerBase<Anexo4, Anexo4Service> {

    public Anexo4Controller(Anexo4Service service, OperationRepository operationRepository) {
        super(service, operationRepository);
    }

    @Override
    protected Anexo4 registrar(Long operationId, Anexo4 input) {
        return service.registrarAnexo4(operationId, input);
    }

    @Override
    protected Anexo4 getAnexoActual(Operation op) {
        return op.getAnexo4Actual();
    }
}