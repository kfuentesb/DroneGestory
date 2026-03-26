package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
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

    @Override
    protected void actualizarCampos(Anexo4 actual, Anexo4 nuevosDatos) {
        // TODO Rellenar campos
        actual.setDescripcion(nuevosDatos.getDescripcion());
        actual.setFechaHoraPrevista(nuevosDatos.getFechaHoraPrevista());
        actual.setMediosMateriales(nuevosDatos.getMediosMateriales());
        actual.setDireccion(nuevosDatos.getDireccion());
        actual.setCoords(nuevosDatos.getCoords());
        actual.setImagenEspacioAereo(nuevosDatos.getImagenEspacioAereo());
        actual.setImagenZonaVuelo(nuevosDatos.getImagenZonaVuelo());
        actual.setEspacioAereoControlado(nuevosDatos.getEspacioAereoControlado());

    }
}