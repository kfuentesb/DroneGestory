package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.operation.OperationCodePreviewDTO;
import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.service.OperationService;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
            @RequestParam(value = "codigo", required = false, defaultValue = "") String codigo,
            Principal principal
    ) {
        User user = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return operationService.createOperationDto(user, conops, codigo);
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

    // NUEVO: Endpoint para servir imágenes guardadas en el Anexo 4
    // Acceso: GET /api/operations/{operationId}/anexo4/images/{filename}
    @GetMapping("/{operationId}/anexo4/images/{filename}")
    public ResponseEntity<Resource> getAnexo4Image(
            @PathVariable Long operationId,
            @PathVariable String filename) {
        try {
            // Validar que el filename es seguro (no contiene path traversal)
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }

            // Construir ruta segura al archivo: uploads/operations/{operationId}/anexo4/{filename}
            Path imagePath = Paths.get("uploads", "operations", String.valueOf(operationId), "anexo4", filename);
            
            // Verificar que el archivo existe
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            // Determinar el tipo MIME basado en la extensión
            String contentType = "image/jpeg";
            if (filename.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (filename.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else if (filename.toLowerCase().endsWith(".webp")) {
                contentType = "image/webp";
            }

            // Servir la imagen
            Resource resource = new FileSystemResource(imagePath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
