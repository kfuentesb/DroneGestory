package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import jakarta.transaction.Transactional;

public abstract class AnexoServiceBase<T extends Anexo> {

    protected final AnexoBaseRepository<T, Long> repository;
    protected final OperationRepository operationRepository;

    public AnexoServiceBase(AnexoBaseRepository<T, Long> repository,
                            OperationRepository operationRepository) {
        this.repository = repository;
        this.operationRepository = operationRepository;
    }

    /**
     * Flujo automático:
     * 1. Hay BORRADOR → actualiza con datos nuevos
     * 2. Hay FIRMADO → crea v(N+1) copiando datos del firmado
     * 3. No hay nada → crea v1 con datos nuevos
     */

    @Transactional
    public T registrarAnexo(Long operationId,
                            T datosNuevos,
                            GetUltimaVersionFunction<Operation, T> getUltimaVersion,
                            GetNextVersionFunction<Operation> getNextVersion) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada" + operationId));

        // Bloqueo si operación completada
        if (op.getEstado() == OperationStatus.COMPLETADA){
            throw new RuntimeException("Operación Completada. Sólo lectura permitida.");
        }

        // Obtener la última versión
        T ultimaVersion = getUltimaVersion.get(op);

        if (ultimaVersion == null) {
            // Caso 3: Primera versión
            return crearNuevaVersion(op, datosNuevos, getNextVersion);
        } else if (ultimaVersion.getEstado() == AnexoStatus.BORRADOR){
            // Caso 1: Actualizar borrador existente
            actualizarCampos(ultimaVersion, datosNuevos);
            return repository.save(ultimaVersion);
        } else {
            // Caso 2: Ultima versión Firmada -> crear copia pegando datos
            T nuevaVersion = crearCopia(ultimaVersion);
            nuevaVersion.setOperation(op);
            nuevaVersion.setNumeroVersion(getNextVersion.get(op));
            nuevaVersion.setEstado(AnexoStatus.BORRADOR);
            nuevaVersion.setFirmadoPor(null);
            nuevaVersion.setFechaFirma(null);

            // Aplicar modificaciones del usuario sobre la copia
            actualizarCampos(nuevaVersion, datosNuevos);
            return repository.save(nuevaVersion);
        }
    }

    private T crearNuevaVersion(Operation op, T datos, GetNextVersionFunction<Operation> getNextVersion) {
        datos.setOperation(op);
        datos.setNumeroVersion(getNextVersion.get(op));
        datos.setEstado(AnexoStatus.BORRADOR);
        return repository.save(datos);
    }

    private void verificarCompletarOperacion(Operation op) {
        if (op.todosAnexosFirmados()) {
            op.setEstado(OperationStatus.COMPLETADA);
            operationRepository.save(op);
        }
    }

    @Transactional
    public T firmarAnexo(Long idAnexo, String username) {
        T anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        if (anexo.getEstado() == AnexoStatus.FIRMADO) {
            throw new RuntimeException("Anexo ya está firmado");
        }

        anexo.setEstado(AnexoStatus.FIRMADO);
        anexo.setFirmadoPor(username);
        anexo.setFechaFirma(java.time.LocalDate.now());

        T guardado = repository.save(anexo);
        verificarCompletarOperacion(guardado.getOperation());

        return guardado;
    }
    // Copia los campos especificos del anexo
    protected abstract T crearCopia(T origen);

    // Actualizar campos con datos del request
    protected abstract void actualizarCampos(T actual, T nuevosDatos);

    // Funcionales para acceder a métodos de Operation
    @FunctionalInterface
    public interface GetUltimaVersionFunction<O, T> { T get(O op); }
    @FunctionalInterface
    public interface GetNextVersionFunction<O> { int get(O op); }
}