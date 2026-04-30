package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CertificateNotificationService {

    @Autowired
    private UserCertificateRepository certificateRepository;

    @Autowired
    private JavaMailSender mailSender;

    // Se ejecuta todos los días a las 9:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendExpirationNotifications() {
        // Calculo de la fecha objetivo: hoy + 30 días
        LocalDate today = LocalDate.now();
        
        checkAndSend(today.plusDays(30), "30 días");

        checkAndSend(today.plusDays(7), "1 semana");
    }

    private void checkAndSend(LocalDate targetDate, String timeframe) {
        List<UserCertificate> expiringCertificates = 
            certificateRepository.findByExpireDateWithUser(targetDate);

        for (UserCertificate cert : expiringCertificates) {
            sendEmail(cert, timeframe);
        }
    }

    private void sendEmail(UserCertificate cert, String timeframe) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(cert.getUser().getEmail());
            message.setSubject("Aviso de caducidad (" + timeframe + "): " + cert.getCertificateType());
            
            message.setText(String.format(
                "Hola %s,\n\nTe informamos que tu certificado '%s' vencerá en %s (el día %s).\n" +
                "Por favor, asegúrate de renovarlo a tiempo para evitar problemas en tus operaciones.\n\n" +
                "Saludos,\nDroneGestory Team",
                cert.getUser().getFirstName(),
                cert.getCertificateType(),
                timeframe,
                cert.getExpireDate()
            ));

            mailSender.send(message);
            System.out.println("Email (" + timeframe + ") enviado a: " + cert.getUser().getEmail());
        } catch (Exception e) {
            System.err.println("Error enviando email a " + cert.getUser().getEmail() + ": " + e.getMessage());
        }
    }
}