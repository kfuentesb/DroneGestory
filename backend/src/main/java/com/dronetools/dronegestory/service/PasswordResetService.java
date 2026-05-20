package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private static final java.util.regex.Pattern PASSWORD_POLICY = java.util.regex.Pattern.compile("^(?=.*\\d).{8,}$");

    @Transactional
    public void sendResetPasswordEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio.");
        }

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(email.trim());
        
        if (userOpt.isEmpty()) {
            System.out.println("Solicitud de recuperación ignorada: No se encontró cuenta con el correo: " + email);
            return; 
        }

        User user = userOpt.get();

        String token = UUID.randomUUID().toString();

        System.out.println("Token de recuperación generado para " + user.getUsername() + ": " + token);

        String resetUrl = "http://localhost:5173/reset-password?token=" + token + "&email=" + user.getEmail();

        sendMailMessage(user.getEmail(), user.getFirstName(), resetUrl);
    }

    @Transactional
    public void updatePasswordWithToken(String email, String token, String newPassword) {
        if (email == null || email.isBlank() || token == null || token.isBlank()) {
            throw new IllegalArgumentException("El enlace de recuperación no es válido.");
        }

        if (newPassword == null || !PASSWORD_POLICY.matcher(newPassword).matches()) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres e incluir al menos 1 número.");
        }

        User user = userRepository.findByUsernameOrEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("Contraseña restablecida con éxito para el usuario: " + user.getUsername());
    }

    private void sendMailMessage(String recipientEmail, String firstName, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("Recuperación de contraseña - DroneGestor");
        
        String body = """
                Hola %s,
                
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en DroneGestor.
                Puedes cambiar tu contraseña haciendo clic en el siguiente enlace:
                
                %s
                
                Este enlace expirará en 15 minutos. Si tú no has realizado esta solicitud, puedes ignorar este correo de forma segura.
                
                Saludos,
                El equipo de DroneGestor.
                """.formatted(firstName != null ? firstName : "Usuario", resetUrl);
                
        message.setText(body);
        mailSender.send(message);
    }
}