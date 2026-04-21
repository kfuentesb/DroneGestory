package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Anexo7Service extends AnexoServiceBase<Anexo7> {
    private final Anexo7Repository anexo7Repository;

    public Anexo7Service(Anexo7Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
        this.anexo7Repository = repository;
    }

    @Transactional
    public Anexo7 registrarAnexo7(Long operationId, Anexo7 datosNuevos) {
        if (datosNuevos.getAircraftId() == null) {
            throw new RuntimeException("Debes seleccionar una aeronave de Anexo 4");
        }

        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        validarOperacionEditable(operation);

        int currentVersion = anexo7Repository.findMaxNumeroVersionByOperationAndAircraftId(operation, datosNuevos.getAircraftId());
        datosNuevos.setNombreConops(operation.getConops());

        if (currentVersion == 0) {
            return crearRegistro(operation, datosNuevos, 1);
        }

        return anexo7Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, currentVersion, datosNuevos.getAircraftId())
                .map(existing -> {
                    if (existing.getEstado() == AnexoStatus.FIRMADO) {
                        throw new RuntimeException("El formulario actual de esta aeronave está firmado. Usa rehacer para crear una nueva versión.");
                    }
                    actualizarCampos(existing, datosNuevos);
                    return anexo7Repository.save(existing);
                })
                .orElseGet(() -> crearRegistro(operation, datosNuevos, currentVersion));
    }

    @Transactional
    public Anexo7 rehacerAnexo7(Long idAnexoOrigen) {
        Anexo7 anexoOrigen = anexo7Repository.findById(idAnexoOrigen)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexoOrigen));

        if (anexoOrigen.getEstado() != AnexoStatus.FIRMADO) {
            throw new RuntimeException("Solo se puede rehacer desde una versión firmada");
        }

        Operation operation = anexoOrigen.getOperation();
        validarOperacionEditable(operation);

        Anexo7 nuevaVersion = new Anexo7();
        nuevaVersion.setOperation(operation);
        nuevaVersion.setNumeroVersion(
            anexo7Repository.findMaxNumeroVersionByOperationAndAircraftId(operation, anexoOrigen.getAircraftId()) + 1
        );
        nuevaVersion.setEstado(AnexoStatus.BORRADOR);
        nuevaVersion.setFirmadoPor(null);
        nuevaVersion.setFechaFirma(null);
        actualizarCampos(nuevaVersion, anexoOrigen);
        return anexo7Repository.save(nuevaVersion);
    }

    @Transactional(readOnly = true)
    public Anexo7 getDatosPorAeronave(Long operationId, Long aircraftId) {
        if (aircraftId == null) {
            throw new RuntimeException("Debes indicar la aeronave seleccionada");
        }
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        int currentVersion = anexo7Repository.findMaxNumeroVersionByOperationAndAircraftId(operation, aircraftId);
        if (currentVersion == 0) {
            return null;
        }
        return anexo7Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, currentVersion, aircraftId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Anexo7 getDatosVersionPorAeronave(Long operationId, int version, Long aircraftId) {
        if (aircraftId == null) {
            throw new RuntimeException("Debes indicar la aeronave seleccionada");
        }
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        return anexo7Repository
                .findByOperationAndNumeroVersionAndAircraftId(operation, version, aircraftId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public java.util.List<Anexo7> getAllAircraftsInVersion(Long operationId, int version) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        return anexo7Repository.findByOperationAndNumeroVersion(operation, version);
    }

    @Transactional
    public void firmarVersionCompleta(Long operationId, int version, String username) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        validarOperacionEditable(operation);

        java.util.List<Anexo7> anexosEnVersion = anexo7Repository.findByOperationAndNumeroVersion(operation, version);
        if (anexosEnVersion.isEmpty()) {
            throw new RuntimeException("No hay datos en esta versión para firmar");
        }

        for (Anexo7 anexo : anexosEnVersion) {
            if (anexo.getEstado() != AnexoStatus.FIRMADO) {
                anexo.setEstado(AnexoStatus.FIRMADO);
                anexo.setFirmadoPor(username);
                anexo.setFechaFirma(java.time.LocalDateTime.now());
                anexo7Repository.save(anexo);
            }
        }
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
        destino.setAircraftId(origen.getAircraftId());
        destino.setFechaOp(origen.getFechaOp());
        destino.setTiempoVueloMinutos(origen.getTiempoVueloMinutos());
        destino.setCiclosAterrizaje(origen.getCiclosAterrizaje());
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

    private Anexo7 crearRegistro(Operation operation, Anexo7 datosNuevos, int version) {
        Anexo7 nuevo = new Anexo7();
        nuevo.setOperation(operation);
        nuevo.setNumeroVersion(version);
        nuevo.setEstado(AnexoStatus.BORRADOR);
        actualizarCampos(nuevo, datosNuevos);
        return anexo7Repository.save(nuevo);
    }

}
