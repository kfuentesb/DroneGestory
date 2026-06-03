package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class Anexo5Service extends AnexoServiceBase<Anexo5> {

    private final UserRepository userRepository;

    public Anexo5Service(
            Anexo5Repository repository,
            OperationRepository operationRepository,
            UserRepository userRepository
    ) {
        super(repository, operationRepository);
        this.userRepository = userRepository;
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operacion no encontrada " + operationId));
        datosNuevos.setNombreConops(operation.getConops());
        Anexo5 saved = registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo5Actual,
                Operation::getNextVersionAnexo5);
        normalizeSignaturesByAssignedUsers(saved, operation, null);
        return repository.save(saved);
    }

    @Override
    @Transactional
    public Anexo5 firmarAnexo(Long idAnexo, String username) {
        Anexo5 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        Operation operation = anexo.getOperation();
        if (operation != null) {
            Set<Integer> assignedUserIds = operation.getAssignedUsers().stream()
                    .map(User::getId)
                    .collect(Collectors.toSet());

            Set<Integer> signedUserIds = anexo.getSignedUsers().stream()
                    .map(User::getId)
                    .collect(Collectors.toSet());

            if (!signedUserIds.containsAll(assignedUserIds)) {
                throw new RuntimeException("No es posible firmar el Anexo 5. Todos los usuarios de la Sección 8 deben estar firmados.");
            }
        }

        return super.firmarAnexo(idAnexo, username);
    }

    @Transactional
    public Anexo5 rehacerAnexo5(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo5);
    }

    @Transactional
    public Anexo5 firmarAptitud(Long operationId, Long idAnexo, String username) {
        Anexo5 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        if (anexo.getOperation() == null || !anexo.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }

        validarOperacionEditable(anexo.getOperation());

        Operation operation = operationRepository.findByIdWithAssignedUsers(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isAssignedUser = operation.getAssignedUsers().stream()
                .anyMatch(user -> user.getId().equals(currentUser.getId()));
        if (!isAssignedUser) {
            throw new RuntimeException("Solo el personal asignado en Anexo 4 puede firmar la aptitud para operar.");
        }

        anexo.getSignedUsers().add(currentUser);
        normalizeSignaturesByAssignedUsers(anexo, operation, username);
        return repository.save(anexo);
    }

    @Transactional
    public void syncCurrentAnexo5SignaturesWithAssignedUsers(Long operationId) {
        Operation operation = operationRepository.findByIdWithAssignedUsers(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo5 current = operation.getAnexo5Actual();
        if (current == null) {
            return;
        }
        normalizeSignaturesByAssignedUsers(current, operation, null);
        repository.save(current);
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

    private void normalizeSignaturesByAssignedUsers(Anexo5 anexo, Operation operation, String signedByUsername) {
        // 1. Mantener solo los usuarios firmantes que realmente están asignados actualmente
        Set<Integer> assignedUserIds = operation.getAssignedUsers().stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        anexo.getSignedUsers().removeIf(user -> !assignedUserIds.contains(user.getId()));

        // ELIMINADO: Ya no cambiamos el estado (AnexoStatus) ni la fecha de firma de forma automática aquí.
        // El estado cambiará a FIRMADO únicamente cuando se llame al método heredado 'firmarAnexo'.
    }

}
