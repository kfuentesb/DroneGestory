package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.anexos.Anexo5AptitudFirma;
import com.dronetools.dronegestory.dto.operation.Anexo5AptitudFirmaDTO;
import com.dronetools.dronegestory.dto.operation.Anexo5AptitudSectionDTO;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo5AptitudFirmaRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import com.dronetools.dronegestory.service.OperationAuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class Anexo5Service extends AnexoServiceBase<Anexo5> {

    private final Anexo5Repository anexo5Repository;
    private final Anexo5AptitudFirmaRepository aptitudFirmaRepository;

    public Anexo5Service(Anexo5Repository repository,
                         OperationRepository operationRepository,
                         OperationAuthorizationService authorizationService,
                         Anexo5AptitudFirmaRepository aptitudFirmaRepository) {
        super(repository, operationRepository, authorizationService);
        this.anexo5Repository = repository;
        this.aptitudFirmaRepository = aptitudFirmaRepository;
    }

    @Transactional
    public Anexo5 registrarAnexo5(Long operationId, Anexo5 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        datosNuevos.setNombreConops(operation.getConops());
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

    @Transactional(readOnly = true)
    public Anexo5AptitudSectionDTO getAptitudSection(Long operationId, Long anexo5Id) {
        Anexo5 anexo5 = getAnexo5ConFirmas(operationId, anexo5Id);
        User currentUser = authorizationService.getCurrentUser();

        boolean puedeFirmar = authorizationService.canManageOperation(anexo5.getOperation(), currentUser);
        boolean yaFirmado = anexo5.getFirmasAptitud().stream()
                .anyMatch(firma -> firma.getFirmante().getId().equals(currentUser.getId()));

        List<Anexo5AptitudFirmaDTO> firmas = anexo5.getFirmasAptitud().stream()
                .map(firma -> toFirmaDto(firma, currentUser, anexo5.getOperation().getCreador().getId()))
                .toList();

        return new Anexo5AptitudSectionDTO(puedeFirmar, yaFirmado, firmas);
    }

    @Transactional
    public Anexo5AptitudSectionDTO firmarAptitud(Long operationId, Long anexo5Id) {
        Anexo5 anexo5 = getAnexo5ConFirmas(operationId, anexo5Id);
        User currentUser = authorizationService.getCurrentUser();

        if (!authorizationService.canManageOperation(anexo5.getOperation(), currentUser)) {
            throw new AccessDeniedException("No tienes permisos para firmar aptitud para operar");
        }

        aptitudFirmaRepository.findByAnexo5IdAndFirmanteId(anexo5.getId(), currentUser.getId())
                .ifPresent(firmaExistente -> {
                    throw new IllegalStateException("Ya has firmado la sección 8: Aptitud para operar");
                });

        Anexo5AptitudFirma firma = new Anexo5AptitudFirma();
        firma.setAnexo5(anexo5);
        firma.setFirmante(currentUser);
        firma.setFechaFirma(LocalDateTime.now());
        aptitudFirmaRepository.save(firma);

        return getAptitudSection(operationId, anexo5Id);
    }

    @Transactional
    public Anexo5AptitudSectionDTO eliminarFirmaAptitud(Long operationId, Long anexo5Id, Long firmaId) {
        Anexo5 anexo5 = getAnexo5ConFirmas(operationId, anexo5Id);
        User currentUser = authorizationService.getCurrentUser();

        Anexo5AptitudFirma firma = aptitudFirmaRepository.findByIdAndAnexo5Id(firmaId, anexo5Id)
                .orElseThrow(() -> new IllegalArgumentException("Firma no encontrada"));

        boolean esPropiaFirma = firma.getFirmante().getId().equals(currentUser.getId());
        boolean esCreadorOperacion = anexo5.getOperation().getCreador().getId().equals(currentUser.getId());
        if (!esPropiaFirma && !esCreadorOperacion && !authorizationService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("No puedes eliminar esta firma");
        }

        aptitudFirmaRepository.delete(firma);
        return getAptitudSection(operationId, anexo5Id);
    }

    private Anexo5 getAnexo5ConFirmas(Long operationId, Long anexo5Id) {
        Anexo5 anexo5 = anexo5Repository.findByIdWithFirmas(anexo5Id)
                .orElseThrow(() -> new RuntimeException("Anexo 5 no encontrado"));
        if (anexo5.getOperation() == null || !anexo5.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        authorizationService.ensureCanManageOperation(anexo5.getOperation());
        return anexo5;
    }

    private Anexo5AptitudFirmaDTO toFirmaDto(Anexo5AptitudFirma firma, User currentUser, Integer creadorId) {
        boolean puedeEliminar = firma.getFirmante().getId().equals(currentUser.getId())
                || creadorId.equals(currentUser.getId())
                || authorizationService.isCurrentUserAdmin();
        return new Anexo5AptitudFirmaDTO(
                firma.getId(),
                firma.getFirmante().getId(),
                firma.getFirmante().getFirstName() + " " + firma.getFirmante().getLastName(),
                firma.getFechaFirma(),
                puedeEliminar
        );
    }
}
