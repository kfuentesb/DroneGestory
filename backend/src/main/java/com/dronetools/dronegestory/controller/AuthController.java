package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Permitir solicitudes desde React
public class AuthController {

    // Dependencias inyectadas
    private final UserRepository userRepository; // Buscar usuario en BD
    private final PasswordEncoder passwordEncoder; // Para comparar la pass sin guardar texto plano
    private final AuthenticationManager authenticationManager;

    // @RequestBody toma el JSON del body y los guardamos en un map
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            // (1) Realiza autenticación Spring
            UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(username, password);

            Authentication authentication = authenticationManager.authenticate(authRequest);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            request.getSession(true); // Asegura la sesión

            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "username", username
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of(
                    "ok", false,
                    "message", "Invalid credentials"
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession(false).invalidate(); // Elimina la sesión actual
        return ResponseEntity.ok(Map.of("ok", true, "message", "Sesión cerrada"));
    }
}
