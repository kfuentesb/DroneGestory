package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo5ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.anexos.Anexo5Repository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.service.anexos.Anexo5Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo5")
public class Anexo5Controller extends AnexoControllerBase<Anexo5, Anexo5Service> {

    public Anexo5Controller(Anexo5Service service,
                            OperationRepository operationRepository,
                            Anexo5Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo5ResponseDTO> createAnexo5(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo5 anexo5) {
        Anexo5 saved = service.registrarAnexo5(operationId, anexo5);
        return ResponseEntity.ok(Anexo5ResponseDTO.fromEntity(saved));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo5ResponseDTO firmarConDatos(@PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo5 anexo = service.firmarAnexo(idAnexo, username);
        return Anexo5ResponseDTO.fromEntity(anexo);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo5ResponseDTO rehacerConDatos(@PathVariable Long idAnexo) {
        Anexo5 anexoRehecho = service.rehacerAnexo5(idAnexo);
        return Anexo5ResponseDTO.fromEntity(anexoRehecho);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo5ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo5 anexo5 = op.getAnexo5Actual();
        if (anexo5 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Anexo5ResponseDTO.fromEntity(anexo5));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo5ResponseDTO> getDatosVersion(@PathVariable Long operationId,
                                                             @PathVariable Long idAnexo) {
        operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo5 anexo5 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));
        if (anexo5.getOperation() == null || !anexo5.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }
        return ResponseEntity.ok(Anexo5ResponseDTO.fromEntity(anexo5));
    }

    @Override
    protected Anexo5 registrar(Long operationId, Anexo5 input) {
        return service.registrarAnexo5(operationId, input);
    }

    @Override
    protected Anexo5 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo5(idAnexo);
    }

    @Override
    protected Anexo5 getAnexoActual(Operation op) {
        return op.getAnexo5Actual();
    }
}

