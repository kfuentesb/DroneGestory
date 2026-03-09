package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Uso de REST + setup URL + constructor
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permitir solicitudes desde React
public class AuthController {

    // Dependencias inyectadas
    private final UserRepository userRepository; // Buscar usuario en BD
    private final PasswordEncoder passwordEncoder; // Para comparar la pass sin guardar texto plano

    // @RequestBody toma el JSON del body y los guardamos en un map
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(user -> ResponseEntity.ok(Map.of(
                    "ok", true,
                    "userId", user.getId(),
                    "username", user.getUsername()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of(
                    "ok", false,
                    "message", "Invalid credentials"
                )));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }
}
