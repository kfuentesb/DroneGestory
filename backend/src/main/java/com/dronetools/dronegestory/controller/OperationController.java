package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.OperationRequestDTO;
import com.dronetools.dronegestory.dto.response.OperationResponseDTO;
import com.dronetools.dronegestory.service.OperationDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationDtoService operationDtoService;

    @GetMapping
    public List<OperationResponseDTO> getAll() {
        return operationDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperationResponseDTO> getById(@PathVariable Integer id) {
        return operationDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OperationResponseDTO> create(@RequestBody OperationRequestDTO dto) {
        return ResponseEntity.ok(operationDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperationResponseDTO> update(@PathVariable Integer id, @RequestBody OperationRequestDTO dto) {
        return operationDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        operationDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}