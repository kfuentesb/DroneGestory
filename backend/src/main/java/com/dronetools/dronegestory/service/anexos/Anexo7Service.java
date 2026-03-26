package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo7Service extends AnexoServiceBase<Anexo7> {

    public Anexo7Service(Anexo7Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo7 registrarAnexo7(Long operationId, Anexo7 datosNuevos) {
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo7Actual,
                Operation::getNextVersionAnexo7);
    }

    @Override
    protected void actualizarCampos(Anexo7 actual, Anexo7 nuevosDatos) {
        actual.setTextoPrueba(nuevosDatos.getTextoPrueba());
    }
}