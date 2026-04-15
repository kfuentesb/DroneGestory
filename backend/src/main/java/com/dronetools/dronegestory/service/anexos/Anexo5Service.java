package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo4;
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
        // Sync nombreConops from Anexo4's title
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        Anexo4 anexo4 = op.getAnexo4Actual();
        if (anexo4 != null && anexo4.getTitle() != null) {
            datosNuevos.setNombreConops(anexo4.getTitle());
        }
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
        actualizarCampos(copia, origen);
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo5 destino, Anexo5 origen) {
        destino.setNombreConops(origen.getNombreConops());
        destino.setFechaOp(origen.getFechaOp());
        destino.setVlos(origen.getVlos());
        destino.setUbicacionObservadores(origen.getUbicacionObservadores());
        destino.setEvaluacionVisibilidadYAlcance(origen.getEvaluacionVisibilidadYAlcance());
        destino.setCondicionantesAcordadosConGestor(origen.getCondicionantesAcordadosConGestor());
        destino.setAnalisisEnFuncionConops(origen.getAnalisisEnFuncionConops());
        destino.setEvaluacionEntornoAereoAdyacente(origen.getEvaluacionEntornoAereoAdyacente());
        destino.setVueloTerrestreControlado(origen.getVueloTerrestreControlado());
        destino.setNotamActivos(origen.getNotamActivos());
        destino.setTsaPreviaNotam(origen.getTsaPreviaNotam());
        destino.setProcedimientosATSP(origen.getProcedimientosATSP());
        destino.setCondicionesClimatologicas(origen.getCondicionesClimatologicas());
        destino.setPersonalSabeFunciones(origen.getPersonalSabeFunciones());
        destino.setComunicacionEntrePersonal(origen.getComunicacionEntrePersonal());
        destino.setComunicacion3Partes(origen.getComunicacion3Partes());
        destino.setRequisitosSeguridad(origen.getRequisitosSeguridad());
        destino.setRequisitosMedioAmbiente(origen.getRequisitosMedioAmbiente());
        destino.setRequisitosRadioelectrico(origen.getRequisitosRadioelectrico());
        destino.setRequisitosLocalesEspecificos(origen.getRequisitosLocalesEspecificos());
        destino.setAtenuacionesGRC(origen.getAtenuacionesGRC());
        destino.setAtenuacionesARC(origen.getAtenuacionesARC());
        destino.setComprobacionesUasVuelo(origen.getComprobacionesUasVuelo());
    }
}

