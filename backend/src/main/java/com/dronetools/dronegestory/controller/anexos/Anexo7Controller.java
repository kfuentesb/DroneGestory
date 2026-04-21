package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo7ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo7Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo7")
public class Anexo7Controller extends AnexoControllerBase<Anexo7, Anexo7Service> {

    public Anexo7Controller(Anexo7Service service,
                            OperationRepository operationRepository,
                            Anexo7Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo7ResponseDTO> createAnexo7(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo7 anexo7) {
        Anexo7 saved = service.registrarAnexo7(operationId, anexo7);
        return ResponseEntity.ok(toResponse(saved, operationId));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo7ResponseDTO firmarConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo7 anexo = service.firmarAnexo(idAnexo, username);
        return toResponse(anexo, operationId);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo7ResponseDTO rehacerConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo) {
        Anexo7 anexoRehecho = service.rehacerAnexo7(idAnexo);
        return toResponse(anexoRehecho, operationId);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo7ResponseDTO> getDatos(@PathVariable Long operationId,
                                                      @RequestParam(value = "aircraftId", required = false) Long aircraftId) {
        if (aircraftId != null) {
            Anexo7 anexo7 = service.getDatosPorAeronave(operationId, aircraftId);
            if (anexo7 == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(toResponse(anexo7, operationId));
        }

        Operation op = operationRepository.findByIdWithAnexos7(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo7 anexo7 = op.getAnexo7Actual();
        if (anexo7 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(toResponse(anexo7, operationId));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo7ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo7 anexo7 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo7.getOperation() == null || !anexo7.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(toResponse(anexo7, operationId));
    }

    @Override
    protected Anexo7 registrar(Long operationId, Anexo7 input) {
        return service.registrarAnexo7(operationId, input);
    }

    @Override
    protected Anexo7 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo7(idAnexo);
    }

    @Override
    protected Anexo7 getAnexoActual(Operation op) {
        return op.getAnexo7Actual();
    }

    private Anexo7ResponseDTO toResponse(Anexo7 anexo, Long operationId) {
        Anexo7ResponseDTO dto = Anexo7ResponseDTO.fromEntity(anexo);
        operationRepository.findById(operationId).ifPresent(operation -> dto.setNombreConops(operation.getConops()));
        return dto;
    }
}
