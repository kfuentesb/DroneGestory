package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class Anexo6Service extends AnexoServiceBase<Anexo6> {

    public Anexo6Service(Anexo6Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        datosNuevos.setNombreConops(operation.getConops());

        Anexo6 ultimaVersion = operation.getAnexo6Actual();
        if (ultimaVersion != null && ultimaVersion.getEstado() == AnexoStatus.FIRMADO) {
            throw new RuntimeException("El anexo actual está firmado. Usa rehacer para crear una nueva versión.");
        }

        int numeroVersion = (ultimaVersion == null) ? operation.getNextVersionAnexo6() : ultimaVersion.getNumeroVersion();
        String serialAeronave = normalizarSerial(datosNuevos.getSerialAeronave());
        Optional<Anexo6> existente = obtenerPorVersionYSerial(operation, numeroVersion, serialAeronave);

        Anexo6 destino = existente.orElseGet(() -> {
            Anexo6 nuevo = new Anexo6();
            nuevo.setOperation(operation);
            nuevo.setNumeroVersion(numeroVersion);
            nuevo.setEstado(AnexoStatus.BORRADOR);
            return nuevo;
        });

        destino.setSerialAeronave(serialAeronave);
        actualizarCampos(destino, datosNuevos);
        return repository.save(destino);
    }

    @Transactional
    public Anexo6 rehacerAnexo6(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo6);
    }

    @Transactional
    public Anexo6 firmarVersionAnexo6(Long idAnexo, String username) {
        Anexo6 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));
        Anexo6 firmado = firmarAnexo(idAnexo, username);
        List<Anexo6> anexosMismaVersion = ((Anexo6Repository) repository)
                .findByOperationAndNumeroVersion(anexo.getOperation(), anexo.getNumeroVersion());
        anexosMismaVersion.stream()
                .filter(item -> !item.getId().equals(firmado.getId()))
                .forEach(item -> {
                    item.setEstado(AnexoStatus.FIRMADO);
                    item.setFirmadoPor(username);
                    item.setFechaFirma(firmado.getFechaFirma());
                });
        repository.saveAll(anexosMismaVersion);
        return ((Anexo6Repository) repository)
                .findFirstByOperationAndSerialAeronaveIgnoreCaseOrderByNumeroVersionDesc(
                        anexo.getOperation(),
                        anexo.getSerialAeronave()
                )
                .orElse(firmado);
    }

    @Transactional(readOnly = true)
    public Anexo6 buscarPorOperacionYSerial(Long operationId, String serialAeronave) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        String serialNormalizado = normalizarSerial(serialAeronave);
        if (serialNormalizado == null) {
            return operation.getAnexo6Actual();
        }
        return ((Anexo6Repository) repository)
                .findFirstByOperationAndSerialAeronaveIgnoreCaseOrderByNumeroVersionDesc(operation, serialNormalizado)
                .orElse(null);
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
        destino.setSerialAeronave(origen.getSerialAeronave());
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

    private Optional<Anexo6> obtenerPorVersionYSerial(Operation operation, int numeroVersion, String serialAeronave) {
        if (serialAeronave == null) {
            return repository.findByOperationAndEstado(operation, AnexoStatus.BORRADOR);
        }
        return ((Anexo6Repository) repository)
                .findFirstByOperationAndNumeroVersionAndSerialAeronaveIgnoreCase(operation, numeroVersion, serialAeronave);
    }

    private String normalizarSerial(String serialAeronave) {
        if (serialAeronave == null || serialAeronave.isBlank()) {
            return null;
        }
        return serialAeronave.trim().toUpperCase();
    }
}
