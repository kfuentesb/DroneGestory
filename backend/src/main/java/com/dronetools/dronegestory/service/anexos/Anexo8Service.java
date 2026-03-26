package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo8Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dronetools.dronegestory.model.enums.AnexoStatus;

@Service
public class Anexo8Service extends AnexoServiceBase<Anexo8> {

    public Anexo8Service(Anexo8Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo8 registrarAnexo8(Long operationId, Anexo8 datosNuevos) {
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo8Actual,
                Operation::getNextVersionAnexo8);
    }

    @Override
    protected void actualizarCampos(Anexo8 actual, Anexo8 nuevosDatos) {
        actual.setTextoPrueba(nuevosDatos.getTextoPrueba());
    }
}