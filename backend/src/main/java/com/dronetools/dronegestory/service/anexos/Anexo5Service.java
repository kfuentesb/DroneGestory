package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo5Service extends AnexoServiceBase<Anexo5> {

    public Anexo5Service(Anexo5Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) {
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo5Actual,
                Operation::getNextVersionAnexo5);
    }

    @Transactional
    public Anexo5 rehacerAnexo5(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo5);
    }

    @Override
    protected Anexo5 crearCopia(Anexo5 origen) {
        Anexo5 copia = new Anexo5();
        copia.setTextoPrueba(origen.getTextoPrueba());
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo5 destino, Anexo5 origen) {
        destino.setTextoPrueba(origen.getTextoPrueba());
    }
}
