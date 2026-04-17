package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.anexos.Anexo5AptitudFirma;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import com.dronetools.dronegestory.service.OperationAuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class Anexo5Service extends AnexoServiceBase<Anexo5> {

    private final UserRepository userRepository;

    public Anexo5Service(Anexo5Repository repository,
                         OperationRepository operationRepository,
                         UserRepository userRepository,
                         OperationAuthorizationService operationAuthorizationService) {
        super(repository, operationRepository, operationAuthorizationService);
        this.userRepository = userRepository;
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        operationAuthorizationService.assertCanOperateOperation(operation);
        datosNuevos.setNombreConops(operation.getConops());
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo5Actual,
                Operation::getNextVersionAnexo5);
    }

    @Transactional
    public Anexo5 rehacerAnexo5(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo5);
    }

    @Transactional
    public Anexo5 firmarAptitudParaOperar(Long operationId, Long idAnexo, String username) {
        Anexo5 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        if (anexo.getOperation() == null || !anexo.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }

        operationAuthorizationService.assertCanOperateOperation(anexo.getOperation());
        operationAuthorizationService.assertCanSignAptitud(anexo.getOperation());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean alreadySigned = anexo.getAptitudFirmas().stream()
                .anyMatch(firma -> firma.getUser().getId().equals(user.getId()));
        if (alreadySigned) {
            throw new RuntimeException("Este usuario ya firmó la aptitud para operar.");
        }

        Anexo5AptitudFirma firma = new Anexo5AptitudFirma();
        firma.setAnexo5(anexo);
        firma.setUser(user);
        firma.setFechaFirma(LocalDateTime.now());
        anexo.getAptitudFirmas().add(firma);
        return repository.save(anexo);
    }

    @Transactional
    public Anexo5 desfirmarAptitudParaOperar(Long operationId, Long idAnexo, Integer firmaUserId) {
        Anexo5 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        if (anexo.getOperation() == null || !anexo.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }

        operationAuthorizationService.assertCanOperateOperation(anexo.getOperation());
        operationAuthorizationService.assertCanRemoveAptitudSignature(anexo.getOperation(), firmaUserId);

        boolean removed = anexo.getAptitudFirmas().removeIf(firma -> firma.getUser().getId().equals(firmaUserId));
        if (!removed) {
            throw new RuntimeException("No existe firma para el usuario indicado.");
        }
        return repository.save(anexo);
    }

    @Override
    protected Anexo5 crearCopia(Anexo5 origen) {
        Anexo5 copia = new Anexo5();
        actualizarCampos(copia, origen);
        if (origen.getOperation() != null) {
            copia.setNombreConops(origen.getOperation().getConops());
        }
        return copia;
    }

    @Override
    protected void actualizarCampos(Anexo5 destino, Anexo5 origen) {
        if (destino.getOperation() != null) {
            destino.setNombreConops(destino.getOperation().getConops());
        }
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
