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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo5")
public class Anexo5Controller extends AnexoControllerBase<Anexo5, Anexo5Service> {

    public Anexo5Controller(Anexo5Service service,
                            OperationRepository operationRepository,
                            Anexo5Repository repository) {
        super(service, operationRepository, repository);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public ResponseEntity<Anexo5ResponseDTO> createAnexo5(@PathVariable Long operationId,
                                                          @ModelAttribute Anexo5 anexo5) {
        Anexo5 saved = service.registrarAnexo5(operationId, anexo5);
        return ResponseEntity.ok(toResponse(saved, operationId));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public Anexo5ResponseDTO firmarConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo5 anexo = service.firmarAptitud(operationId, idAnexo, username);
        return toResponse(anexo, operationId);
    }

    @PutMapping("/{idAnexo}/firmar/documento")
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public Anexo5ResponseDTO firmarDocumento(@PathVariable Long operationId, @PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo5 anexo = service.firmarAnexo(idAnexo, username);
        return toResponse(anexo, operationId);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public Anexo5ResponseDTO rehacerConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo) {
        Anexo5 anexoRehecho = service.rehacerAnexo5(idAnexo);
        return toResponse(anexoRehecho, operationId);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo5ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos5(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo5 anexo5 = op.getAnexo5Actual();
        if (anexo5 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(toResponse(anexo5, operationId));
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
        return ResponseEntity.ok(toResponse(anexo5, operationId));
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

    private Anexo5ResponseDTO toResponse(Anexo5 anexo, Long operationId) {
        Anexo5ResponseDTO dto = Anexo5ResponseDTO.fromEntity(anexo);
        operationRepository.findByIdWithAssignedUsers(operationId).ifPresent(operation -> {
            dto.setNombreConops(operation.getConops());

            Set<Integer> signedUserIds = anexo.getSignedUsers().stream()
                    .map(user -> user.getId())
                    .collect(Collectors.toSet());

            dto.setAssignedPersonnel(operation.getAssignedUsers().stream().map(user -> {
                Anexo5ResponseDTO.AssignedPersonnelSignatureDTO personnelDto = new Anexo5ResponseDTO.AssignedPersonnelSignatureDTO();
                personnelDto.setId(user.getId());
                personnelDto.setUsername(user.getUsername());
                personnelDto.setFullName((user.getFirstName() + " " + user.getLastName()).trim());
                personnelDto.setRoles(user.getEffectiveRoles().stream().toList());
                personnelDto.setSigned(signedUserIds.contains(user.getId()));
                return personnelDto;
            }).toList());
        });
        return dto;
    }
}

