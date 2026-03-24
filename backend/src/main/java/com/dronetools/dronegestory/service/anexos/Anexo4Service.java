package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo4Service {
    private final Anexo4Repository anexo4Repository;
    private final OperationRepository operationRepository;

    public Anexo4Service(Anexo4Repository anexo4Repository, OperationRepository operationRepository) {
        this.anexo4Repository = anexo4Repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public Anexo4 registrarAnexo4(Long operationId, Anexo4 datosNuevos) {
        // 1. Validar que la operación existe
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        // 2. Obtener la versión más reciente (gracias al @OrderBy que pusimos en Operation)
        Anexo4 actual = op.getAnexo4Actual();

        // 3. Lógica de Versiones
        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            // Caso A: Existe un borrador -> ACTUALIZAMOS la versión actual
            actual.setDescripcion(datosNuevos.getDescripcion());
            actual.setFechaHoraPrevista(datosNuevos.getFechaHoraPrevista());
            actual.setMediosMateriales(datosNuevos.getMediosMateriales());
            actual.setDireccion(datosNuevos.getDireccion());
            actual.setCoords(datosNuevos.getCoords());
            actual.setImagenEspacioAereo(datosNuevos.getImagenEspacioAereo());
            actual.setImagenZonaVuelo(datosNuevos.getImagenZonaVuelo());
            actual.setEspacioAereoControlado(datosNuevos.getEspacioAereoControlado());
            
            return anexo4Repository.save(actual);
        } else {
            // Caso B: No hay nada O lo que hay está FIRMADO -> NUEVA VERSIÓN
            datosNuevos.setOperation(op);
            datosNuevos.setNumeroVersion(op.getNextVersionAnexo4());
            datosNuevos.setEstado(AnexoStatus.BORRADOR);
            
            return anexo4Repository.save(datosNuevos);
        }
    }

    @Transactional
    public Anexo4 firmarAnexo4(Long idAnexo) {
        Anexo4 anexo = anexo4Repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        
        anexo.setEstado(AnexoStatus.FIRMADO);
        return anexo4Repository.save(anexo);
    }
}