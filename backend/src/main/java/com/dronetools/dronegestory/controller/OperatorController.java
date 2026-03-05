package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.OperatorRequestDTO;
import com.dronetools.dronegestory.dto.response.OperatorResponseDTO;
import com.dronetools.dronegestory.service.OperatorDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorDtoService operatorDtoService;

    @GetMapping
    public List<OperatorResponseDTO> getAll() {
        return operatorDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatorResponseDTO> getById(@PathVariable Integer id) {
        return operatorDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OperatorResponseDTO> create(@RequestBody OperatorRequestDTO dto) {
        return ResponseEntity.ok(operatorDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperatorResponseDTO> update(@PathVariable Integer id, @RequestBody OperatorRequestDTO dto) {
        return operatorDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        operatorDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}