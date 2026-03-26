package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

public abstract class AnexoControllerBase<T extends Anexo, S extends AnexoServiceBase<T>> {

    protected final S service;
    protected final OperationRepository operationRepository;

    public AnexoControllerBase(S service, OperationRepository operationRepository) {
        this.service = service;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public T saveOrUpdate(@PathVariable Long operationId, @RequestBody T input) {
        return registrar(operationId, input);
    }

    @GetMapping("/actual")
    public T getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return getAnexoActual(op);
    }
    
    @PutMapping("/{idAnexo}/firmar")
    public T firmar(@PathVariable Long idAnexo, Principal principal) {
        // Obtenemos el username del token de seguridad (Principal)
        String username = (principal != null) ? principal.getName() : "Sistema";
        return service.firmarAnexo(idAnexo, username);
    }

    // Métodos que cada controlador hijo debe implementar
    protected abstract T registrar(Long operationId, T input);
    protected abstract T getAnexoActual(Operation op);
}