package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo7ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo7Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo7Service;
import com.dronetools.dronegestory.service.OperationAccessService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo7")
public class Anexo7Controller extends AnexoControllerBase<Anexo7, Anexo7Service> {

    public Anexo7Controller(Anexo7Service service,
                            OperationRepository operationRepository,
                            Anexo7Repository repository,
                            OperationAccessService operationAccessService) {
        super(service, operationRepository, repository, operationAccessService);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo7ResponseDTO> createAnexo7(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo7 anexo7) {
        Anexo7 saved = service.registrarAnexo7(operationId, anexo7);
        return ResponseEntity.ok(Anexo7ResponseDTO.fromEntity(saved));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo7ResponseDTO firmarConDatos(@PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo7 anexo = service.firmarAnexo(idAnexo, username);
        return Anexo7ResponseDTO.fromEntity(anexo);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo7ResponseDTO rehacerConDatos(@PathVariable Long idAnexo) {
        Anexo7 anexoRehecho = service.rehacerAnexo7(idAnexo);
        return Anexo7ResponseDTO.fromEntity(anexoRehecho);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo7ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos7(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(op);
        Anexo7 anexo7 = op.getAnexo7Actual();
        if (anexo7 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Anexo7ResponseDTO.fromEntity(anexo7));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo7ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(operation);
        Anexo7 anexo7 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo7.getOperation() == null || !anexo7.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(Anexo7ResponseDTO.fromEntity(anexo7));
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
}
