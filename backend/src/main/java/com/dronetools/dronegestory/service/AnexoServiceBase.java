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

    public AnexoServiceBase(AnexoBaseRepository<T, Long> repository, OperationRepository operationRepository) {
        this.repository = repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public T registrarAnexo(Long operationId, T datosNuevos, GetUltimaVersionFunction<Operation, T> getUltimaVersion, GetNextVersionFunction<Operation> getNextVersion) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        // BLOQUEO SEGÚN ESTADO
        if (op.getEstado() == OperationStatus.COMPLETADA) {
            throw new RuntimeException("La operación está COMPLETADA y no admite más cambios.");
        }

        // Obtener la última versión
        T actual = getUltimaVersion.get(op);

        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            actualizarCampos(actual, datosNuevos);
            return repository.save(actual);
        } else {
            datosNuevos.setOperation(op);
            datosNuevos.setNumeroVersion(getNextVersion.get(op));
            datosNuevos.setEstado(AnexoStatus.BORRADOR);
            return repository.save(datosNuevos);
        }
    }

    /**
     * Debes sobreescribir este método en cada subclase para copiar campos específicos.
     * Si los campos son iguales, puedes hacerlo aquí; si no, que lo implemente cada hijo.
     */
    protected abstract void actualizarCampos(T actual, T nuevosDatos);

    @Transactional
    public T firmarAnexo(Long idAnexo, String username) {
        T anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));

        anexo.setEstado(AnexoStatus.FIRMADO);
        anexo.setFirmadoPor(username);
        anexo.setFechaFirma(java.time.LocalDate.now());

        T guardado = repository.save(anexo);

        Operation op = guardado.getOperation();
        // Si todos están firmados, cerramos la operación definitivamente
        if (op.todosAnexosFirmados()) {
            op.setEstado(OperationStatus.COMPLETADA);
            operationRepository.save(op);
        }

        return guardado;
    }

    // Funcionales para versión genérica, para operar con métodos propios de Operation
    @FunctionalInterface
    public interface GetUltimaVersionFunction<O, T> { T get(O op); }
    @FunctionalInterface
    public interface GetNextVersionFunction<O> { int get(O op); }
}