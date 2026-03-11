package com.dronetools.dronegestory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        // Aquí debes usar algún mecanismo para identificar quién está logueado.
        // Si no tienes JWT o sesión, solo devolverá OK siempre (NO SEGURO).
        return ResponseEntity.ok(
                java.util.Map.of(
                        "status", "authenticated",
                        "message", "Bienvenido al dashboard protegido"
                )
        );
    }
}
