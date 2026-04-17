package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
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
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        datosNuevos.setNombreConops(operation.getConops());
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo7Actual,
                Operation::getNextVersionAnexo7);
    }

    @Transactional
    public Anexo7 rehacerAnexo7(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo7);
    }

    @Override
    protected Anexo7 crearCopia(Anexo7 origen) {
        Anexo7 copia = new Anexo7();
        actualizarCampos(copia, origen);
        if (origen.getOperation() != null) {
            copia.setNombreConops(origen.getOperation().getConops());
        }
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo7 destino, Anexo7 origen) {
        if (destino.getOperation() != null) {
            destino.setNombreConops(destino.getOperation().getConops());
        }
        destino.setFechaOp(origen.getFechaOp());
        destino.setEstructuraCorrecto(origen.getEstructuraCorrecto());
        destino.setEstructuraObservaciones(origen.getEstructuraObservaciones());
        destino.setBateriasCorrecto(origen.getBateriasCorrecto());
        destino.setBateriasObservaciones(origen.getBateriasObservaciones());
        destino.setSensoresCorrecto(origen.getSensoresCorrecto());
        destino.setSensoresObservaciones(origen.getSensoresObservaciones());
        destino.setMotoresCorrecto(origen.getMotoresCorrecto());
        destino.setMotoresObservaciones(origen.getMotoresObservaciones());
        destino.setHelicesCorrecto(origen.getHelicesCorrecto());
        destino.setHelicesObservaciones(origen.getHelicesObservaciones());
        destino.setPartesMovilesCorrecto(origen.getPartesMovilesCorrecto());
        destino.setPartesMovilesObservaciones(origen.getPartesMovilesObservaciones());
        destino.setComunicacionesCorrecto(origen.getComunicacionesCorrecto());
        destino.setComunicacionesObservaciones(origen.getComunicacionesObservaciones());
        destino.setPlantaPotenciaCorrecto(origen.getPlantaPotenciaCorrecto());
        destino.setPlantaPotenciaObservaciones(origen.getPlantaPotenciaObservaciones());
        destino.setCargaPagoCorrecto(origen.getCargaPagoCorrecto());
        destino.setCargaPagoObservaciones(origen.getCargaPagoObservaciones());
        destino.setIdentificacionRemotaCorrecto(origen.getIdentificacionRemotaCorrecto());
        destino.setIdentificacionRemotaObservaciones(origen.getIdentificacionRemotaObservaciones());
        destino.setSistemaGeoconscienciaCorrecto(origen.getSistemaGeoconscienciaCorrecto());
        destino.setSistemaGeoconscienciaObservaciones(origen.getSistemaGeoconscienciaObservaciones());
        destino.setDatosVueloCorrecto(origen.getDatosVueloCorrecto());
        destino.setDatosVueloObservaciones(origen.getDatosVueloObservaciones());
        destino.setOtrosVerificacionCorrecto(origen.getOtrosVerificacionCorrecto());
        destino.setOtrosVerificacionObservaciones(origen.getOtrosVerificacionObservaciones());
        destino.setAeronaveCorrecto(origen.getAeronaveCorrecto());
        destino.setAeronaveObservaciones(origen.getAeronaveObservaciones());
        destino.setUnidadControlCorrecto(origen.getUnidadControlCorrecto());
        destino.setUnidadControlObservaciones(origen.getUnidadControlObservaciones());
        destino.setSensoresRecogidaCorrecto(origen.getSensoresRecogidaCorrecto());
        destino.setSensoresRecogidaObservaciones(origen.getSensoresRecogidaObservaciones());
        destino.setAntenasCorrecto(origen.getAntenasCorrecto());
        destino.setAntenasObservaciones(origen.getAntenasObservaciones());
        destino.setOtrosRecogidaCorrecto(origen.getOtrosRecogidaCorrecto());
        destino.setOtrosRecogidaObservaciones(origen.getOtrosRecogidaObservaciones());
    }
}

