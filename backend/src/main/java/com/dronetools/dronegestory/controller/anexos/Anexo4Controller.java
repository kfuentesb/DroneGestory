package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoRequestDTO;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.service.anexos.Anexo4Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo4")
public class Anexo4Controller extends AnexoControllerBase<Anexo4, Anexo4Service> {

    public Anexo4Controller(Anexo4Service service,
                            OperationRepository operationRepository,
                            Anexo4Repository repository) {
        super(service, operationRepository, repository);
    }

    @Override
    protected Anexo4 registrar(Long operationId, Anexo4 input) {
        return service.registrarAnexo4(operationId, input);
    }

    @Override
    protected Anexo4 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo4(idAnexo);
    }

    @Override
    protected Anexo4 getAnexoActual(Operation op) {
        return op.getAnexo4Actual();
    }

    @Override
    protected Anexo4 convertDtoToEntity(AnexoRequestDTO dto) {
        Anexo4 anexo = new Anexo4();
        anexo.setTextoPrueba(dto.getTextoPrueba());
        return anexo;
    }
}
