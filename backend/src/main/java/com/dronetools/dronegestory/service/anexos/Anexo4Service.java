package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo4Service extends AnexoServiceBase<Anexo4> {

    public Anexo4Service(Anexo4Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo4 registrarAnexo4(Long operationId, Anexo4 datosNuevos) {
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo4Actual,
                Operation::getNextVersionAnexo4);
    }

    @Transactional
    public Anexo4 rehacerAnexo4(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo4);
    }

    @Override
    protected void actualizarCampos(Anexo4 destino, Anexo4 origen) {
        destino.setTextoPrueba(origen.getTextoPrueba());
    }

    @Override
    protected Anexo4 crearCopia(Anexo4 origen) {
        Anexo4 copia = new Anexo4();
        copia.setTextoPrueba(origen.getTextoPrueba());
        return copia;
    }
}
