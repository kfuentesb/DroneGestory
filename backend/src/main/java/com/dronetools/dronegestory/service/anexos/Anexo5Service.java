package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo5; // Cambiar a 6,7,8
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository; // Cambiar
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo5Service extends AnexoServiceBase<Anexo5> { // Cambiar número

    public Anexo5Service(Anexo5Repository repository, OperationRepository operationRepository) { // Cambiar
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) { // Cambiar número
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo5Actual,      // Cambiar
                Operation::getNextVersionAnexo5); // Cambiar
    }

    @Override
    protected Anexo5 crearCopia(Anexo5 origen) { // Cambiar número
        Anexo5 copia = new Anexo5(); // Cambiar
        copia.setTextoPrueba(origen.getTextoPrueba());
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo5 destino, Anexo5 origen) { // Cambiar número
        destino.setTextoPrueba(origen.getTextoPrueba());
    }
}