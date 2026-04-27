package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.operation.OperationCodePreviewDTO;
import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.service.OperationService;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService operationService;
    private final UserService userService;

    @GetMapping
    public List<OperationListDTO> getAll() {
        return operationService.getAllOperationListDTOs();
    }

    @GetMapping("/details/mine")
    public List<OperationListDTO> getMyOperations(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return operationService.getMyOperationListDTOs(user.getId());
    }

    // Endpoint para mostrar en frontend el codigo real sugerido por backend.
    @GetMapping("/next-codigo")
    @PreAuthorize("@operationSecurity.canCreateOperation(authentication)")
    public OperationCodePreviewDTO getNextCodigo() {
        return new OperationCodePreviewDTO(operationService.previewNextCodigo());
    }

    @PostMapping
    @PreAuthorize("@operationSecurity.canCreateOperation(authentication)")
    public OperationDetailDTO create(
            @RequestParam(value = "conops", required = false, defaultValue = "") String conops,
            Principal principal
    ) {
        User user = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return operationService.createOperationDto(user, conops);
    }

    @PutMapping("/{operationId}")
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public OperationDetailDTO update(@PathVariable Long operationId, @ModelAttribute Operation op) {
        return operationService.updateOperationDto(operationId, op);
    }

    @PutMapping("/{operationId}/completar")
    @PreAuthorize("@operationSecurity.canEditOperation(authentication, #operationId)")
    public OperationDetailDTO completar(@PathVariable Long operationId) {
        return operationService.completarOperationDto(operationId);
    }

    @PutMapping("/{operationId}/cancelar")
    @PreAuthorize("@operationSecurity.canCancelOperation(authentication, #operationId)")
    public OperationDetailDTO cancelar(@PathVariable Long operationId) {
        return operationService.cancelarOperationDto(operationId);
    }

    @GetMapping("/{operationId}")
    public OperationDetailDTO getById(@PathVariable Long operationId) {
        return operationService.findByIdDto(operationId);
    }

    @PreAuthorize("@operationSecurity.canDeleteOperation(authentication, #operationId)")
    @DeleteMapping("/{operationId}")
    public ResponseEntity<Void> deleteOperation(@PathVariable Long operationId) {
        operationService.deleteOperationWithAnexos(operationId);
        return ResponseEntity.noContent().build();
    }
}
