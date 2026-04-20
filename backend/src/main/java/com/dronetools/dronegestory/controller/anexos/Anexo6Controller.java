package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo6ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo6Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo6")
public class Anexo6Controller extends AnexoControllerBase<Anexo6, Anexo6Service> {

    public Anexo6Controller(Anexo6Service service,
                            OperationRepository operationRepository,
                            Anexo6Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo6ResponseDTO> createAnexo6(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo6 anexo6) {
        Anexo6 saved = service.registrarAnexo6(operationId, anexo6);
        return ResponseEntity.ok(toResponse(saved, operationId));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo6ResponseDTO firmarConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo6 anexo = service.firmarVersionAnexo6(idAnexo, username);
        return toResponse(anexo, operationId);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo6ResponseDTO rehacerConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo) {
        Anexo6 anexoRehecho = service.rehacerAnexo6(idAnexo);
        return toResponse(anexoRehecho, operationId);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo6ResponseDTO> getDatos(@PathVariable Long operationId,
                                                      @RequestParam(required = false) String serialAeronave) {
        Anexo6 anexo6 = service.buscarPorOperacionYSerial(operationId, serialAeronave);
        if (anexo6 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(toResponse(anexo6, operationId));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo6ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo6 anexo6 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo6.getOperation() == null || !anexo6.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(toResponse(anexo6, operationId));
    }

    @Override
    protected Anexo6 registrar(Long operationId, Anexo6 input) {
        return service.registrarAnexo6(operationId, input);
    }

    @Override
    protected Anexo6 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo6(idAnexo);
    }

    @Override
    protected Anexo6 getAnexoActual(Operation op) {
        return op.getAnexo6Actual();
    }

    private Anexo6ResponseDTO toResponse(Anexo6 anexo, Long operationId) {
        Anexo6ResponseDTO dto = Anexo6ResponseDTO.fromEntity(anexo);
        operationRepository.findById(operationId).ifPresent(operation -> dto.setNombreConops(operation.getConops()));
        return dto;
    }
}
