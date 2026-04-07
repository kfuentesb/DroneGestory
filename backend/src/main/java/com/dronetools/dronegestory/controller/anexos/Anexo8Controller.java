package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoRequestDTO;
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

    @Override
    protected Anexo8 convertDtoToEntity(AnexoRequestDTO dto) {
        Anexo8 anexo = new Anexo8();
        anexo.setTextoPrueba(dto.getTextoPrueba());
        return anexo;
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
