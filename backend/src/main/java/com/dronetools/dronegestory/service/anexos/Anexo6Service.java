package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;

@Service
public class Anexo6Service extends AnexoServiceBase<Anexo6> {

    public Anexo6Service(Anexo6Repository repository, OperationRepository operationRepository) {
        super(repository, operationRepository);
    }

    @Transactional
    public Anexo6 registrarAnexo6(Long operationId, Anexo6 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        String serialAeronave = validarYNormalizarSerial(operation, datosNuevos.getSerialAeronave());
        datosNuevos.setSerialAeronave(serialAeronave);
        datosNuevos.setNombreConops(operation.getConops());
        return registrarAnexo(operationId, datosNuevos,
                op -> op.getAnexos6().stream()
                        .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                        .max(Comparator.comparingInt(Anexo6::getNumeroVersion))
                        .orElse(null),
                op -> op.getAnexos6().stream()
                        .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                        .mapToInt(Anexo6::getNumeroVersion)
                        .max()
                        .orElse(0) + 1
        );
    }

    @Transactional
    public Anexo6 rehacerAnexo6(Long idAnexoOrigen) {
        Anexo6 anexoOrigen = repository.findById(idAnexoOrigen)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexoOrigen));

        if (anexoOrigen.getEstado() != AnexoStatus.FIRMADO) {
            throw new RuntimeException("Solo se puede rehacer desde una versión firmada");
        }

        Operation operation = anexoOrigen.getOperation();
        String serialAeronave = validarYNormalizarSerial(operation, anexoOrigen.getSerialAeronave());

        Anexo6 borradorMismaAeronave = operation.getAnexos6().stream()
                .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                .filter(anexo -> anexo.getEstado() == AnexoStatus.BORRADOR)
                .findFirst()
                .orElse(null);
        if (borradorMismaAeronave != null) {
            throw new RuntimeException("Ya existe un borrador para esta aeronave en Anexo 6.");
        }

        Anexo6 nuevaVersion = crearCopia(anexoOrigen);
        nuevaVersion.setOperation(operation);
        nuevaVersion.setSerialAeronave(serialAeronave);
        nuevaVersion.setNumeroVersion(operation.getAnexos6().stream()
                .filter(anexo -> serialAeronave.equals(normalizarSerial(anexo.getSerialAeronave())))
                .mapToInt(Anexo6::getNumeroVersion)
                .max()
                .orElse(0) + 1);
        nuevaVersion.setEstado(AnexoStatus.BORRADOR);
        nuevaVersion.setFirmadoPor(null);
        nuevaVersion.setFechaFirma(null);
        return repository.save(nuevaVersion);
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
        destino.setSerialAeronave(normalizarSerial(origen.getSerialAeronave()));
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

    private String validarYNormalizarSerial(Operation operation, String serialAeronave) {
        String serialNormalizado = normalizarSerial(serialAeronave);
        if (serialNormalizado.isBlank()) {
            throw new RuntimeException("Debe seleccionar una aeronave para gestionar el Anexo 6.");
        }

        Anexo4 anexo4Actual = operation.getAnexo4Actual();
        if (anexo4Actual == null || anexo4Actual.getSerialesAeronaves() == null || anexo4Actual.getSerialesAeronaves().isEmpty()) {
            throw new RuntimeException("Debe asignar aeronaves en Anexo 4 antes de gestionar el Anexo 6.");
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
