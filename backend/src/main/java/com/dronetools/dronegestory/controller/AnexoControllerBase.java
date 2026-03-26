package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.operation.AnexoHistoricoDTO;
import com.dronetools.dronegestory.dto.operation.AnexoRequestDTO;
import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;


public abstract class AnexoControllerBase<T extends Anexo, S extends AnexoServiceBase<T>> {

    protected final S service;
    protected final OperationRepository operationRepository;
    protected final AnexoBaseRepository<T, Long> repository;

    public AnexoControllerBase(S service,
                               OperationRepository operationRepository,
                               AnexoBaseRepository<T, Long> repository) {
        this.service = service;
        this.operationRepository = operationRepository;
        this.repository = repository;
    }

    @PostMapping
    public T saveOrUpdate(@PathVariable Long operationId, @ModelAttribute AnexoRequestDTO dto) {
        T input = convertDtoToEntity(dto);
        return registrar(operationId, input);
    }

    @GetMapping("/actual")
    public T getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return getAnexoActual(op);
    }

    @GetMapping("/historico")
    public List<AnexoHistoricoDTO> getHistorico(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        List<T> anexos = repository.findByOperationOrderByNumeroVersionDesc(op);
        return AnexoHistoricoDTO.fromEntityList(
                anexos.stream().map(a -> (Anexo) a).collect(Collectors.toList()));
    }

    @PutMapping("/{idAnexo}/firmar")
    public T firmar(@PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        return service.firmarAnexo(idAnexo, username);
    }

    @PostMapping("/{idAnexo}/rehacer")
    public T rehacer(@PathVariable Long idAnexo) {
        return rehacerDesde(idAnexo);
    }

    protected abstract T registrar(Long operationId, T input);
    protected abstract T rehacerDesde(Long idAnexo);
    protected abstract T getAnexoActual(Operation op);
    protected abstract T convertDtoToEntity(AnexoRequestDTO dto);
}
