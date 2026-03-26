package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoRequestDTO;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo7Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo7")
public class Anexo7Controller extends AnexoControllerBase<Anexo7, Anexo7Service> {

    public Anexo7Controller(Anexo7Service service,
                            OperationRepository operationRepository,
                            Anexo7Repository repository) {
        super(service, operationRepository, repository);
    }

    @Override
    protected Anexo7 convertDtoToEntity(AnexoRequestDTO dto) {
        Anexo7 anexo = new Anexo7();
        anexo.setTextoPrueba(dto.getTextoPrueba());
        return anexo;
    }

    @Override
    protected Anexo7 registrar(Long operationId, Anexo7 input) {
        return service.registrarAnexo7(operationId, input);
    }

    @Override
    protected Anexo7 getAnexoActual(Operation op) {
        return op.getAnexo7Actual();
    }
}