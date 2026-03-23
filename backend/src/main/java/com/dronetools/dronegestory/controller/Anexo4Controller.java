package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/operations/{operationId}/anexo4")
@CrossOrigin(origins = "*")
public class Anexo4Controller {

    private final Anexo4Repository anexo4Repository;
    private final OperationRepository operationRepository;

    public Anexo4Controller(Anexo4Repository anexo4Repository, OperationRepository operationRepository) {
        this.anexo4Repository = anexo4Repository;
        this.operationRepository = operationRepository;
    }

    @PostMapping
    public Anexo4 saveOrUpdateAnexo4(@PathVariable Long operationId, @RequestBody Anexo4 input) {
        // 1. Buscamos la operación
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        // 2. Obtenemos la versión actual (la última)
        Anexo4 actual = op.getAnexo4Actual();

        // 3. Lógica de negocio:
        if (actual != null && actual.getEstado() == AnexoStatus.BORRADOR) {
            // Si existe y es borrador, ACTUALIZAMOS el existente
            actual.setFechaHoraPrevista(input.getFechaHoraPrevista());
            actual.setMediosMateriales(input.getMediosMateriales());
            actual.setDireccion(input.getDireccion());
            actual.setCoords(input.getCoords());
            actual.setImagenEspacioAereo(input.getImagenEspacioAereo());
            return anexo4Repository.save(actual);
        } else {
            // Si no existe O el anterior está FIRMADO, CREAMOS NUEVA VERSIÓN
            input.setOperation(op);
            input.setNumeroVersion(op.getNextVersionAnexo4());
            input.setEstado(AnexoStatus.BORRADOR);
            return anexo4Repository.save(input);
        }
    }

    @GetMapping("/actual")
    public Anexo4 getActual(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        return op.getAnexo4Actual();
    }
}