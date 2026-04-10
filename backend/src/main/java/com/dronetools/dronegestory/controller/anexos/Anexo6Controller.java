package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoInfoDTO;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo6Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo6")
public class Anexo6Controller extends AnexoControllerBase<Anexo6, Anexo6Service> {

    public Anexo6Controller(Anexo6Service service,
                            OperationRepository operationRepository,
                            Anexo6Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping
    public AnexoInfoDTO saveOrUpdate(@PathVariable Long operationId,
                                     @RequestParam(required = false) String textoPrueba) {
        Anexo6 input = new Anexo6();
        input.setTextoPrueba(textoPrueba);
        Anexo6 saved = service.registrarAnexo6(operationId, input);
        return AnexoInfoDTO.from(saved);
    }

    @Override
    protected Anexo6 registrar(Long operationId, Anexo6 input) {
        return service.registrarAnexo6(operationId, input);
    }

    @Override
    protected Anexo6 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo6(idAnexo);
    }

    @Override
    protected Anexo6 getAnexoActual(Operation op) {
        return op.getAnexo6Actual();
    }
}
