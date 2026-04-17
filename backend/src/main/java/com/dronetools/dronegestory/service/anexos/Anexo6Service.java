package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import com.dronetools.dronegestory.service.OperationAuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class Anexo6Service extends AnexoServiceBase<Anexo6> {

    public Anexo6Service(Anexo6Repository repository,
                         OperationRepository operationRepository,
                         OperationAuthorizationService operationAuthorizationService) {
        super(repository, operationRepository, operationAuthorizationService);
    }

    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        datosNuevos.setNombreConops(operation.getConops());
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
        actualizarCampos(copia, origen);
        if (origen.getOperation() != null) {
            copia.setNombreConops(origen.getOperation().getConops());
        }
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo6 destino, Anexo6 origen) {
        if (destino.getOperation() != null) {
            destino.setNombreConops(destino.getOperation().getConops());
        }
        destino.setFechaOp(origen.getFechaOp());
        destino.setMaterialesAuxiliares(
                origen.getMaterialesAuxiliares() == null ? new ArrayList<>() : new ArrayList<>(origen.getMaterialesAuxiliares())
        );
        destino.setSinImpacto(origen.getSinImpacto());
        destino.setCentroGravedad(origen.getCentroGravedad());
        destino.setIntegridadEstructural(origen.getIntegridadEstructural());
        destino.setCableado(origen.getCableado());
        destino.setVerificacionLuces(origen.getVerificacionLuces());
        destino.setCalibracion(origen.getCalibracion());
        destino.setValidarSalidaDatos(origen.getValidarSalidaDatos());
        destino.setGiranLibremente(origen.getGiranLibremente());
        destino.setSentidoGiroCorrecto(origen.getSentidoGiroCorrecto());
        destino.setSinImpactoMotores(origen.getSinImpactoMotores());
        destino.setColocacionCorrecta(origen.getColocacionCorrecta());
        destino.setSujetacionFirme(origen.getSujetacionFirme());
        destino.setSinImpactoHelices(origen.getSinImpactoHelices());
        destino.setBateriaCarga(origen.getBateriaCarga());
        destino.setMovimientoFluidoMando(origen.getMovimientoFluidoMando());
        destino.setSinImpactoPartesMoviles(origen.getSinImpactoPartesMoviles());
        destino.setMovimientoFluidoPartesMoviles(origen.getMovimientoFluidoPartesMoviles());
        destino.setAntenasInstaladasYOrientadas(origen.getAntenasInstaladasYOrientadas());
        destino.setCalidadOnda(origen.getCalidadOnda());
        destino.setRecepcionAdecuada(origen.getRecepcionAdecuada());
        destino.setFuenteAlimentacion(origen.getFuenteAlimentacion());
        destino.setNivelFuenteAlimentacion(origen.getNivelFuenteAlimentacion());
        destino.setFijacionCorrecta(origen.getFijacionCorrecta());
        destino.setMemoriaSuficienteParaDatos(origen.getMemoriaSuficienteParaDatos());
        destino.setSinImpactoCargaPago(origen.getSinImpactoCargaPago());
        destino.setConexionesCargaPago(origen.getConexionesCargaPago());
        destino.setDatosCargados(origen.getDatosCargados());
        destino.setTransmisionDatos(origen.getTransmisionDatos());
        destino.setInformacionActualizada(origen.getInformacionActualizada());
        destino.setSistemaActivado(origen.getSistemaActivado());
    }
}
