package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.AnexoRequestDTO;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo5Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo5")
public class Anexo5Controller extends AnexoControllerBase<Anexo5, Anexo5Service> {

    public Anexo5Controller(Anexo5Service service,
                            OperationRepository operationRepository,
                            Anexo5Repository repository) {
        super(service, operationRepository, repository);
    }

    @Override
    protected Anexo5 convertDtoToEntity(AnexoRequestDTO dto) {
        Anexo5 anexo = new Anexo5();
        anexo.setTextoPrueba(dto.getTextoPrueba());
        return anexo;
    }

    @Override
    protected Anexo5 registrar(Long operationId, Anexo5 input) {
        return service.registrarAnexo5(operationId, input);
    }

    @Override
    protected Anexo5 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo5(idAnexo);
    }

    @Override
    protected Anexo5 getAnexoActual(Operation op) {
        return op.getAnexo5Actual();
    }
}
