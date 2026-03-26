package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    protected Anexo7 crearCopia(Anexo7 origen) {
        Anexo7 copia = new Anexo7();
        copia.setTextoPrueba(origen.getTextoPrueba());
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo7 destino, Anexo7 origen) {
        destino.setTextoPrueba(origen.getTextoPrueba());
    }
}