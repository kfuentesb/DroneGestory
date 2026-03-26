package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Anexo6 rehacerAnexo6(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo6);
    }

    @Override
    protected Anexo6 crearCopia(Anexo6 origen) {
        Anexo6 copia = new Anexo6();
        copia.setTextoPrueba(origen.getTextoPrueba());
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo6 destino, Anexo6 origen) {
        destino.setTextoPrueba(origen.getTextoPrueba());
    }
}
