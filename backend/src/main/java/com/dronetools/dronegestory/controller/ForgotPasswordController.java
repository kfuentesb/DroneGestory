package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            passwordResetService.sendResetPasswordEmail(email);
            
            // Retornamos un mensaje genérico por seguridad.
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "Si el correo está registrado, se habrá enviado un enlace de recuperación."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "ok", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "ok", false,
                "message", "Error interno al procesar el envío."
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (token == null || token.isBlank() || email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Datos incompletos."));
        }

        try {
            
            System.out.println("Procesando actualización de contraseña para: " + email + " con token: " + token);

            passwordResetService.updatePasswordWithToken(email, token, newPassword);

            return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "Contraseña cambiada con éxito."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "ok", false,
                "message", e.getMessage() //"El enlace ha expirado o ya fue utilizado"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "ok", false,
                "message", "Error al procesar el cambio."
            ));
        }
    }
}