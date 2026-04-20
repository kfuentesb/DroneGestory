package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Locale;

@Service
public class Anexo7Service extends AnexoServiceBase<Anexo7> {

    public Anexo7Service(Anexo7Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo7 registrarAnexo7(Long operationId, Anexo7 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        String serialAeronave = validarYNormalizarSerial(operation, datosNuevos.getSerialAeronave());
        datosNuevos.setSerialAeronave(serialAeronave);
        validarCamposOperacion(datosNuevos);
        datosNuevos.setNombreConops(operation.getConops());
        return registrarAnexo(operationId, datosNuevos,
                op -> op.getAnexos7().stream()
                        .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                        .max(Comparator.comparingInt(Anexo7::getNumeroVersion))
                        .orElse(null),
                op -> op.getAnexos7().stream()
                        .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                        .mapToInt(Anexo7::getNumeroVersion)
                        .max()
                        .orElse(0) + 1
        );
    }

    @Transactional
    public Anexo7 rehacerAnexo7(Long idAnexoOrigen) {
        Anexo7 anexoOrigen = repository.findById(idAnexoOrigen)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexoOrigen));

        if (anexoOrigen.getEstado() != AnexoStatus.FIRMADO) {
            throw new RuntimeException("Solo se puede rehacer desde una versión firmada");
        }

        Operation operation = anexoOrigen.getOperation();
        String serialAeronave = validarYNormalizarSerial(operation, anexoOrigen.getSerialAeronave());

        Anexo7 borradorMismaAeronave = operation.getAnexos7().stream()
                .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                .filter(anexo -> anexo.getEstado() == AnexoStatus.BORRADOR)
                .findFirst()
                .orElse(null);
        if (borradorMismaAeronave != null) {
            throw new RuntimeException("Ya existe un borrador para esta aeronave en Anexo 7.");
        }

        Anexo7 nuevaVersion = crearCopia(anexoOrigen);
        nuevaVersion.setOperation(operation);
        nuevaVersion.setSerialAeronave(serialAeronave);
        nuevaVersion.setNumeroVersion(operation.getAnexos7().stream()
                .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                .mapToInt(Anexo7::getNumeroVersion)
                .max()
                .orElse(0) + 1);
        nuevaVersion.setEstado(AnexoStatus.BORRADOR);
        nuevaVersion.setFirmadoPor(null);
        nuevaVersion.setFechaFirma(null);
        return repository.save(nuevaVersion);
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
        destino.setSerialAeronave(normalizarSerial(origen.getSerialAeronave()));
        destino.setFechaOp(origen.getFechaOp());
        destino.setTiempoDeVuelo(origen.getTiempoDeVuelo());
        destino.setCiclosDeAterrizaje(origen.getCiclosDeAterrizaje());
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

    private void validarCamposOperacion(Anexo7 anexo7) {
        if (anexo7.getTiempoDeVuelo() == null || anexo7.getTiempoDeVuelo() < 0) {
            throw new RuntimeException("El campo tiempo_de_vuelo es obligatorio y debe ser un entero válido.");
        }
        if (anexo7.getCiclosDeAterrizaje() == null || anexo7.getCiclosDeAterrizaje() < 0) {
            throw new RuntimeException("El campo ciclos_de_aterrizaje es obligatorio y debe ser un entero válido.");
        }
    }

    private String validarYNormalizarSerial(Operation operation, String serialAeronave) {
        String serialNormalizado = normalizarSerial(serialAeronave);
        if (serialNormalizado.isBlank()) {
            throw new RuntimeException("Debe seleccionar una aeronave para gestionar el Anexo 7.");
        }

        Anexo4 anexo4Actual = operation.getAnexo4Actual();
        if (anexo4Actual == null || anexo4Actual.getSerialesAeronaves() == null || anexo4Actual.getSerialesAeronaves().isEmpty()) {
            throw new RuntimeException("Debe asignar aeronaves en Anexo 4 antes de gestionar el Anexo 7.");
        }

        boolean serialAsignado = anexo4Actual.getSerialesAeronaves().stream()
                .map(this::normalizarSerial)
                .anyMatch(serialNormalizado::equals);
        if (!serialAsignado) {
            throw new RuntimeException("La aeronave seleccionada no está asignada en Anexo 4.");
        }

        return serialNormalizado;
    }

    private String normalizarSerial(String serial) {
        return serial == null ? "" : serial.trim().toUpperCase(Locale.ROOT);
    }
}
