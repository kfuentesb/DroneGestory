package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.request.UserRequestDTO;
import com.dronetools.dronegestory.dto.response.UserResponseDTO;
import com.dronetools.dronegestory.service.UserDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserDtoService userDtoService;

    @GetMapping
    public List<UserResponseDTO> getAll() {
        return userDtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Integer id) {
        return userDtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userDtoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Integer id, @RequestBody UserRequestDTO dto) {
        return userDtoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userDtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}