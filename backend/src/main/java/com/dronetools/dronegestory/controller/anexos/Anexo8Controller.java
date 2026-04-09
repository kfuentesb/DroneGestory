package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoInfoDTO;
import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo8Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo8Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo8")
public class Anexo8Controller extends AnexoControllerBase<Anexo8, Anexo8Service> {

    public Anexo8Controller(Anexo8Service service,
                            OperationRepository operationRepository,
                            Anexo8Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping
    public AnexoInfoDTO saveOrUpdate(@PathVariable Long operationId,
                                     @RequestParam(required = false) String textoPrueba) {
        Anexo8 input = new Anexo8();
        input.setTextoPrueba(textoPrueba);
        Anexo8 saved = service.registrarAnexo8(operationId, input);
        return AnexoInfoDTO.from(saved);
    }

    @Override
    protected Anexo8 registrar(Long operationId, Anexo8 input) {
        return service.registrarAnexo8(operationId, input);
    }

    @Override
    protected Anexo8 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo8(idAnexo);
    }

    @Override
    protected Anexo8 getAnexoActual(Operation op) {
        return op.getAnexo8Actual();
    }
}
