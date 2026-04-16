package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo8ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo8Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo8Service;
import com.dronetools.dronegestory.service.OperationAccessService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo8")
public class Anexo8Controller extends AnexoControllerBase<Anexo8, Anexo8Service> {

    public Anexo8Controller(Anexo8Service service,
                            OperationRepository operationRepository,
                            Anexo8Repository repository,
                            OperationAccessService operationAccessService) {
        super(service, operationRepository, repository, operationAccessService);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo8ResponseDTO> createAnexo8(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo8 anexo8) {
        Anexo8 saved = service.registrarAnexo8(operationId, anexo8);
        return ResponseEntity.ok(Anexo8ResponseDTO.fromEntity(saved));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo8ResponseDTO firmarConDatos(@PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo8 anexo = service.firmarAnexo(idAnexo, username);
        return Anexo8ResponseDTO.fromEntity(anexo);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo8ResponseDTO rehacerConDatos(@PathVariable Long idAnexo) {
        Anexo8 anexoRehecho = service.rehacerAnexo8(idAnexo);
        return Anexo8ResponseDTO.fromEntity(anexoRehecho);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo8ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos8(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(op);
        Anexo8 anexo8 = op.getAnexo8Actual();
        if (anexo8 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Anexo8ResponseDTO.fromEntity(anexo8));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo8ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        operationAccessService.assertCanAccess(operation);
        Anexo8 anexo8 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo8.getOperation() == null || !anexo8.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(Anexo8ResponseDTO.fromEntity(anexo8));
    }

    @Override
    protected Anexo8 registrar(Long operationId, Anexo8 input) {
        return service.registrarAnexo8(operationId, input);
    }

    @Override
    protected Anexo8 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo8(idAnexo);
    }

    @Override
    protected Anexo8 getAnexoActual(Operation op) {
        return op.getAnexo8Actual();
    }
}
