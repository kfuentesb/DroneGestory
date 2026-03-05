package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Uso de REST + setup URL + constructor
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // Dependencias inyectadas
    private final UserRepository userRepository; // Buscar usuario en BD
    private final PasswordEncoder passwordEncoder; // Para comparar la pass sin guardar texto plano

    // @RequestBody toma el JSON del body y los guardamos en un map
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        // Datos del user
        String username = body.get("username");
        String password = body.get("password");

        return userRepository.findByUsername(username)
                // Buscar el usuario y validar su pass
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(user -> ResponseEntity.ok(Map.of(
                        // Respuesta ok -> 200, userId, operatorId, username
                        "ok", true,
                        "userId", user.getId(),
                        "operatorId", user.getOperator().getId(),
                        "username", user.getUsername()
                )))
                // Respuesta 401 si falla
                .orElse(ResponseEntity.status(401).body(Map.of(
                        "ok", false,
                        "message", "Invalid credentials"
                )));
    }
}
