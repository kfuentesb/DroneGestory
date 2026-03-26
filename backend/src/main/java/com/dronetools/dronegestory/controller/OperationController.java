package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.operation.OperationDetailDTO;
import com.dronetools.dronegestory.dto.operation.OperationListDTO;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.service.OperationService;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/auth/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService operationService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<OperationListDTO> getAll() {
        return operationService.getAllOperations()
                .stream()
                .map(OperationListDTO::new)
                .toList();
    }

    @GetMapping("/details/mine")
    public List<OperationListDTO> getMyOperations(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return operationService.findOperationsByUserId(user.getId())
                .stream()
                .map(OperationListDTO::new)
                .toList();
    }

    @PostMapping
    public OperationDetailDTO create(@ModelAttribute Operation op, Principal principal) {
        User user = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        op.setCreador(user);
        return new OperationDetailDTO(operationService.saveOperation(op));
    }

    @PutMapping("/{operationId}")
    public OperationDetailDTO update(@PathVariable Long operationId, @ModelAttribute Operation op) {
        return new OperationDetailDTO(operationService.updateOperation(operationId, op));
    }

    @GetMapping("/{operationId}")
    public OperationDetailDTO getById(@PathVariable Long operationId) {
        return new OperationDetailDTO(operationService.findById(operationId));
    }

    @DeleteMapping("/{operationId}")
    public void delete(@PathVariable Long operationId) {
        operationService.deleteOperation(operationId);
    }
}
