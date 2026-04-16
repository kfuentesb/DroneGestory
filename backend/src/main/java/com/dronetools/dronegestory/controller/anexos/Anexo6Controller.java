package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo6ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo6Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo6Service;
import com.dronetools.dronegestory.service.OperationAccessService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo6")
public class Anexo6Controller extends AnexoControllerBase<Anexo6, Anexo6Service> {

    public Anexo6Controller(Anexo6Service service,
                            OperationRepository operationRepository,
                            Anexo6Repository repository,
                            OperationAccessService operationAccessService) {
        super(service, operationRepository, repository, operationAccessService);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo6ResponseDTO> createAnexo6(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo6 anexo6) {
        Anexo6 saved = service.registrarAnexo6(operationId, anexo6);
        return ResponseEntity.ok(Anexo6ResponseDTO.fromEntity(saved));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo6ResponseDTO firmarConDatos(@PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo6 anexo = service.firmarAnexo(idAnexo, username);
        return Anexo6ResponseDTO.fromEntity(anexo);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo6ResponseDTO rehacerConDatos(@PathVariable Long idAnexo) {
        Anexo6 anexoRehecho = service.rehacerAnexo6(idAnexo);
        return Anexo6ResponseDTO.fromEntity(anexoRehecho);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo6ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos6(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(op);
        Anexo6 anexo6 = op.getAnexo6Actual();
        if (anexo6 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Anexo6ResponseDTO.fromEntity(anexo6));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo6ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(operation);
        Anexo6 anexo6 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo6.getOperation() == null || !anexo6.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(Anexo6ResponseDTO.fromEntity(anexo6));
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
}
