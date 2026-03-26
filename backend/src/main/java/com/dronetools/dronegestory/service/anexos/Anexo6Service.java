package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo6Service extends AnexoServiceBase<Anexo6> {

    public Anexo6Service(Anexo6Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }
    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo6Actual,
                Operation::getNextVersionAnexo6);
    }

    @Override
    protected void actualizarCampos(Anexo6 actual, Anexo6 nuevosDatos) {
        actual.setTextoPrueba(nuevosDatos.getTextoPrueba());
    }
}