package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo8Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo8Service extends AnexoServiceBase<Anexo8> {

    public Anexo8Service(Anexo8Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo8 registrarAnexo8(Long operationId, Anexo8 datosNuevos) {
        // Sync nombreConops from Anexo4's title
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        Anexo4 anexo4 = op.getAnexo4Actual();
        if (anexo4 != null && anexo4.getTitle() != null) {
            datosNuevos.setNombreConops(anexo4.getTitle());
        }
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo8Actual,
                Operation::getNextVersionAnexo8);
    }

    @Transactional
    public Anexo8 rehacerAnexo8(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo8);
    }

    @Override
    protected Anexo8 crearCopia(Anexo8 origen) {
        Anexo8 copia = new Anexo8();
        actualizarCampos(copia, origen);
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo8 destino, Anexo8 origen) {
        destino.setNombreConops(origen.getNombreConops());
        destino.setFechaOp(origen.getFechaOp());
        destino.setCondicionesATSP(origen.getCondicionesATSP());
        destino.setComunicacion3FinalizacionOperacion(origen.getComunicacion3FinalizacionOperacion());
        destino.setComunicacionZrvfCecaf(origen.getComunicacionZrvfCecaf());
        destino.setAnotacionTiempoVueloAeronave(origen.getAnotacionTiempoVueloAeronave());
        destino.setAnotacionTIempoActividadPersonal(origen.getAnotacionTIempoActividadPersonal());
        destino.setAnotacionEventosOcurridosOperacion(origen.getAnotacionEventosOcurridosOperacion());
        destino.setComunicacionIncidentes(origen.getComunicacionIncidentes());
    }
}

