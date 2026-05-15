package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public abstract class AnexoServiceBase<T extends Anexo> {

    protected final AnexoBaseRepository<T, Long> repository;
    protected final OperationRepository operationRepository;

    public AnexoServiceBase(AnexoBaseRepository<T, Long> repository,
                            OperationRepository operationRepository) {
        this.repository = repository;
        this.operationRepository = operationRepository;
    }

    @Transactional
    public T registrarAnexo(Long operationId,
                            T datosNuevos,
                            GetUltimaVersionFunction<Operation, T> getUltimaVersion,
                            GetNextVersionFunction<Operation> getNextVersion) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));

        validarOperacionEditable(op);

        T ultimaVersion = getUltimaVersion.get(op);
        if (ultimaVersion == null) {
            return crearNuevaVersion(op, datosNuevos, getNextVersion);
        }
        if (ultimaVersion.getEstado() == AnexoStatus.BORRADOR) {
            actualizarCampos(ultimaVersion, datosNuevos);
            return repository.save(ultimaVersion);
        }
        throw new RuntimeException("El anexo actual está firmado. Usa rehacer para crear una nueva versión.");
    }

    @Transactional
    public T rehacerAnexo(Long idAnexoOrigen, GetNextVersionFunction<Operation> getNextVersion) {
        T anexoOrigen = repository.findById(idAnexoOrigen)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexoOrigen));

        if (anexoOrigen.getEstado() != AnexoStatus.FIRMADO) {
            throw new RuntimeException("Solo se puede rehacer desde una versión firmada");
        }

        Operation op = anexoOrigen.getOperation();
        validarOperacionEditable(op);

        repository.findByOperationAndEstado(op, AnexoStatus.BORRADOR)
                .ifPresent(anexo -> {
                    throw new RuntimeException("Ya existe un borrador para este anexo. Debes editarlo o firmarlo antes.");
                });

        reopenOperationIfCompleted(op);
        T nuevaVersion = crearCopia(anexoOrigen);
        nuevaVersion.setOperation(op);
        nuevaVersion.setNumeroVersion(getNextVersion.get(op));
        nuevaVersion.setEstado(AnexoStatus.BORRADOR);
        nuevaVersion.setFirmadoPor(null);
        nuevaVersion.setFechaFirma(null);
        afterRehacerCopia(anexoOrigen, nuevaVersion);
        return repository.save(nuevaVersion);
    }

    @Transactional
    public T firmarAnexo(Long idAnexo, String username) {
        T anexo = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado: " + idAnexo));

        validarOperacionEditable(anexo.getOperation());

        if (anexo.getEstado() == AnexoStatus.FIRMADO) {
            throw new RuntimeException("Anexo ya está firmado");
        }

        anexo.setEstado(AnexoStatus.FIRMADO);
        anexo.setFirmadoPor(username);
        anexo.setFechaFirma(java.time.LocalDateTime.now());
        return repository.save(anexo);
    }

    private T crearNuevaVersion(Operation op, T datos, GetNextVersionFunction<Operation> getNextVersion) {
        reopenOperationIfCompleted(op);
        datos.setOperation(op);
        datos.setNumeroVersion(getNextVersion.get(op));
        datos.setEstado(AnexoStatus.BORRADOR);
        return repository.save(datos);
    }

    private void reopenOperationIfCompleted(Operation op) {
        if (op != null && op.getEstado() == OperationStatus.COMPLETADA && esAdminActual()) {
            op.setEstado(OperationStatus.EN_CURSO);
            operationRepository.save(op);
        }
    }

    protected void validarOperacionEditable(Operation op) {
        if (op.getEstado() == OperationStatus.CANCELADA) {
            throw new RuntimeException("Operación cancelada. Solo lectura.");
        }
        if (op.getEstado() == OperationStatus.COMPLETADA && !esAdminActual()) {
            throw new RuntimeException("Operación completada. Solo lectura para usuarios no administradores.");
        }
    }

    protected boolean esAdminActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    protected abstract T crearCopia(T origen);
    protected abstract void actualizarCampos(T actual, T nuevosDatos);

    protected void afterRehacerCopia(T origen, T nuevaVersion) {
    }

    @FunctionalInterface
    public interface GetUltimaVersionFunction<O, T> {
        T get(O op);
    }

    @FunctionalInterface
    public interface GetNextVersionFunction<O> {
        int get(O op);
    }
}
