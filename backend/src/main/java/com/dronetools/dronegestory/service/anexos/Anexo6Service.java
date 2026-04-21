package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class Anexo6Service extends AnexoServiceBase<Anexo6> {
    private final Anexo6Repository anexo6Repository;

    public Anexo6Service(Anexo6Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
        this.anexo6Repository = repository;
    }

    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        if (datosNuevos.getAircraftId() == null) {
            throw new RuntimeException("Debes seleccionar una aeronave de Anexo 4");
        }

        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        validarOperacionEditable(operation);

        int currentVersion = anexo6Repository.findMaxNumeroVersionByOperation(operation);
        datosNuevos.setNombreConops(operation.getConops());

        if (currentVersion == 0) {
            return crearRegistro(operation, datosNuevos, 1);
        }

        return anexo6Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, currentVersion, datosNuevos.getAircraftId())
                .map(existing -> {
                    if (existing.getEstado() == AnexoStatus.FIRMADO) {
                        throw new RuntimeException("El formulario actual de esta aeronave está firmado. Usa rehacer para crear una nueva versión.");
                    }
                    actualizarCampos(existing, datosNuevos);
                    return anexo6Repository.save(existing);
                })
                .orElseGet(() -> crearRegistro(operation, datosNuevos, currentVersion));
    }

    @Transactional
    public Anexo6 rehacerAnexo6(Long idAnexoOrigen) {
        Anexo6 anexoOrigen = anexo6Repository.findById(idAnexoOrigen)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexoOrigen));

        if (anexoOrigen.getEstado() != AnexoStatus.FIRMADO) {
            throw new RuntimeException("Solo se puede rehacer desde una versión firmada");
        }

        Operation operation = anexoOrigen.getOperation();
        validarOperacionEditable(operation);

        Anexo6 nuevaVersion = new Anexo6();
        nuevaVersion.setOperation(operation);
        nuevaVersion.setNumeroVersion(anexo6Repository.findMaxNumeroVersionByOperation(operation) + 1);
        nuevaVersion.setEstado(AnexoStatus.BORRADOR);
        nuevaVersion.setNombreConops(operation.getConops());
        nuevaVersion.setAircraftId(anexoOrigen.getAircraftId());
        return anexo6Repository.save(nuevaVersion);
    }

    @Transactional(readOnly = true)
    public Anexo6 getDatosPorAeronave(Long operationId, Long aircraftId) {
        if (aircraftId == null) {
            throw new RuntimeException("Debes indicar la aeronave seleccionada");
        }
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        int currentVersion = anexo6Repository.findMaxNumeroVersionByOperation(operation);
        if (currentVersion == 0) {
            return null;
        }
        return anexo6Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, currentVersion, aircraftId)
                .orElseGet(() -> buildEmptyDraft(operation, aircraftId, currentVersion));
    }

    @Transactional(readOnly = true)
    public Anexo6 getDatosVersionPorAeronave(Long operationId, int version, Long aircraftId) {
        if (aircraftId == null) {
            throw new RuntimeException("Debes indicar la aeronave seleccionada");
        }
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        return anexo6Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, version, aircraftId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public java.util.List<Anexo6> getAllAircraftsInVersion(Long operationId, int version) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        return anexo6Repository.findByOperationAndNumeroVersion(operation, version);
    }

    @Transactional
    public void firmarVersionCompleta(Long operationId, int version, String username) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        validarOperacionEditable(operation);

        java.util.List<Anexo6> anexosEnVersion = anexo6Repository.findByOperationAndNumeroVersion(operation, version);
        if (anexosEnVersion.isEmpty()) {
            throw new RuntimeException("No hay datos en esta versión para firmar");
        }

        for (Anexo6 anexo : anexosEnVersion) {
            if (anexo.getEstado() != AnexoStatus.FIRMADO) {
                anexo.setEstado(AnexoStatus.FIRMADO);
                anexo.setFirmadoPor(username);
                anexo.setFechaFirma(java.time.LocalDateTime.now());
                anexo6Repository.save(anexo);
            }
        }
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
        destino.setAircraftId(origen.getAircraftId());
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

    private Anexo6 crearRegistro(Operation operation, Anexo6 datosNuevos, int version) {
        Anexo6 nuevo = new Anexo6();
        nuevo.setOperation(operation);
        nuevo.setNumeroVersion(version);
        nuevo.setEstado(AnexoStatus.BORRADOR);
        actualizarCampos(nuevo, datosNuevos);
        return anexo6Repository.save(nuevo);
    }

    private Anexo6 buildEmptyDraft(Operation operation, Long aircraftId, int version) {
        Anexo6 emptyDraft = new Anexo6();
        emptyDraft.setOperation(operation);
        emptyDraft.setNumeroVersion(version);
        emptyDraft.setEstado(AnexoStatus.BORRADOR);
        emptyDraft.setNombreConops(operation.getConops());
        emptyDraft.setAircraftId(aircraftId);
        return emptyDraft;
    }
}
