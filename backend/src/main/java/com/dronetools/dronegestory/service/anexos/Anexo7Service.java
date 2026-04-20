package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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

        Anexo7 ultimaVersion = operation.getAnexo7Actual();
        if (ultimaVersion != null && ultimaVersion.getEstado() == AnexoStatus.FIRMADO) {
            throw new RuntimeException("El anexo actual está firmado. Usa rehacer para crear una nueva versión.");
        }

        int numeroVersion = (ultimaVersion == null) ? operation.getNextVersionAnexo7() : ultimaVersion.getNumeroVersion();
        String serialAeronave = normalizarSerial(datosNuevos.getSerialAeronave());
        Optional<Anexo7> existente = obtenerPorVersionYSerial(operation, numeroVersion, serialAeronave);

        Anexo7 destino = existente.orElseGet(() -> {
            Anexo7 nuevo = new Anexo7();
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
    public Anexo7 rehacerAnexo7(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo7);
    }

    @Transactional
    public Anexo7 firmarVersionAnexo7(Long idAnexo, String username) {
        Anexo7 anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));
        Anexo7 firmado = firmarAnexo(idAnexo, username);
        List<Anexo7> anexosMismaVersion = ((Anexo7Repository) repository)
                .findByOperationAndNumeroVersion(anexo.getOperation(), anexo.getNumeroVersion());
        anexosMismaVersion.stream()
                .filter(item -> !item.getId().equals(firmado.getId()))
                .forEach(item -> {
                    item.setEstado(AnexoStatus.FIRMADO);
                    item.setFirmadoPor(username);
                    item.setFechaFirma(firmado.getFechaFirma());
                });
        repository.saveAll(anexosMismaVersion);
        return ((Anexo7Repository) repository)
                .findFirstByOperationAndSerialAeronaveIgnoreCaseOrderByNumeroVersionDesc(
                        anexo.getOperation(),
                        anexo.getSerialAeronave()
                )
                .orElse(firmado);
    }

    @Transactional(readOnly = true)
    public Anexo7 buscarPorOperacionYSerial(Long operationId, String serialAeronave) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        String serialNormalizado = normalizarSerial(serialAeronave);
        if (serialNormalizado == null) {
            return operation.getAnexo7Actual();
        }
        return ((Anexo7Repository) repository)
                .findFirstByOperationAndSerialAeronaveIgnoreCaseOrderByNumeroVersionDesc(operation, serialNormalizado)
                .orElse(null);
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
        destino.setSerialAeronave(origen.getSerialAeronave());
        destino.setFechaOp(origen.getFechaOp());
        destino.setMinutosVuelo(origen.getMinutosVuelo());
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

    @Transactional(readOnly = true)
    public List<Anexo7> obtenerEntradasConMinutos(Long operationId, int numeroVersion) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        return ((Anexo7Repository) repository)
                .findByOperationAndNumeroVersionAndMinutosVueloIsNotNull(operation, numeroVersion);
    }

    private Optional<Anexo7> obtenerPorVersionYSerial(Operation operation, int numeroVersion, String serialAeronave) {
        if (serialAeronave == null) {
            return repository.findByOperationAndEstado(operation, AnexoStatus.BORRADOR);
        }
        return ((Anexo7Repository) repository)
                .findFirstByOperationAndNumeroVersionAndSerialAeronaveIgnoreCase(operation, numeroVersion, serialAeronave);
    }

    private String normalizarSerial(String serialAeronave) {
        if (serialAeronave == null || serialAeronave.isBlank()) {
            return null;
        }
        return serialAeronave.trim().toUpperCase();
    }
}
