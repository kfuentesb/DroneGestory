package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.ExtraDate;
import com.dronetools.dronegestory.model.Maintenance;
import com.dronetools.dronegestory.model.NotificationSettings;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.AutomaticMailPreferenceRepository;
import com.dronetools.dronegestory.repository.ExtraDateRepository;
import com.dronetools.dronegestory.repository.MaintenanceRepository;
import com.dronetools.dronegestory.repository.NotificationSettingsRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int SETTINGS_ID = 1;

    private final UserCertificateRepository certificateRepository;
    private final OperationRepository operationRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ExtraDateRepository extraDateRepository;
    private final AutomaticMailPreferenceRepository automaticMailPreferenceRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final JavaMailSender mailSender;

    @Scheduled(cron = "0 0 * * * ?", zone = "Europe/Madrid")
    @Transactional
    public void sendDailyNotifications() {
        ZonedDateTime now = ZonedDateTime.now(java.time.ZoneId.of("Europe/Madrid"));
        LocalDate today = now.toLocalDate();
        NotificationSettings settings = getOrCreateSettings();

        if (now.getHour() != settings.getScheduleHour() || today.equals(settings.getLastRunDate())) {
            return;
        }

        Map<Integer, NotificationDigest> digestsByUserId = new LinkedHashMap<>();
        collectCertificateNotifications(digestsByUserId, today.plusDays(settings.getCertificateFirstDaysAhead()), settings.getCertificateFirstDaysAhead());
        if (!settings.getCertificateFirstDaysAhead().equals(settings.getCertificateSecondDaysAhead())) {
            collectCertificateNotifications(digestsByUserId, today.plusDays(settings.getCertificateSecondDaysAhead()), settings.getCertificateSecondDaysAhead());
        }
        collectOperationNotifications(digestsByUserId, today.plusDays(settings.getOperationDaysAhead()), settings.getOperationDaysAhead());
        collectMaintenanceNotifications(digestsByUserId, today.plusDays(settings.getMaintenanceDaysAhead()), settings.getMaintenanceDaysAhead());
        collectEventNotifications(digestsByUserId, today.plusDays(settings.getEventDaysAhead()), settings.getEventDaysAhead());

        digestsByUserId.values().stream()
                .filter(NotificationDigest::hasNotifications)
                .forEach(this::sendDigestEmail);

        settings.setLastRunDate(today);
        notificationSettingsRepository.save(settings);
    }

    private void collectCertificateNotifications(Map<Integer, NotificationDigest> digestsByUserId, LocalDate targetDate, int daysAhead) {
        Set<Integer> enabledUserIds = automaticMailPreferenceRepository.findCertificateUsers()
                .stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        for (UserCertificate certificate : certificateRepository.findByExpireDateWithUser(targetDate)) {
            User user = certificate.getUser();
            if (!canSendTo(user, enabledUserIds)) {
                continue;
            }
            digestFor(digestsByUserId, user).add(
                    "Certificados",
                    String.format(
                            "El certificado '%s' (%s) vence en %s dias, el %s.",
                            certificate.getCertificateType(),
                            certificate.getCertificateName(),
                            daysAhead,
                            certificate.getExpireDate()
                    )
            );
        }
    }

    private void collectOperationNotifications(Map<Integer, NotificationDigest> digestsByUserId, LocalDate operationDate, int daysAhead) {
        Set<Integer> enabledUserIds = automaticMailPreferenceRepository.findOperationUsers()
                .stream()
                .map(User::getId)
                .collect(Collectors.toSet());
        LocalDateTime start = operationDate.atStartOfDay();
        LocalDateTime end = operationDate.plusDays(1).atStartOfDay();

        for (Operation operation : operationRepository.findByAnexo4FechaHoraPrevistaBetweenWithAssignedUsers(start, end)) {
            for (User user : operationRecipients(operation)) {
                if (!canSendTo(user, enabledUserIds)) {
                    continue;
                }
                digestFor(digestsByUserId, user).add(
                        "Operaciones",
                        String.format(
                                "La operacion %s esta programada en %s dias, el %s.",
                                operation.getCodigo(),
                                daysAhead,
                                operationDate
                        )
                );
            }
        }
    }

    private void collectMaintenanceNotifications(Map<Integer, NotificationDigest> digestsByUserId, LocalDate maintenanceDate, int daysAhead) {
        List<User> recipients = automaticMailPreferenceRepository.findMaintenanceUsers();
        Date targetDate = Date.valueOf(maintenanceDate);

        for (Maintenance maintenance : maintenanceRepository.findByNextMaintenanceDate(targetDate)) {
            for (User user : recipients) {
                if (!canSendTo(user)) {
                    continue;
                }
                digestFor(digestsByUserId, user).add(
                        "Mantenimiento",
                        String.format(
                                "El mantenimiento '%s' de la aeronave %s esta programado en %s dias, el %s.",
                                maintenance.getReviewType(),
                                maintenance.getAircraft().getSerialNumber(),
                                daysAhead,
                                maintenanceDate
                        )
                );
            }
        }
    }

    private void collectEventNotifications(Map<Integer, NotificationDigest> digestsByUserId, LocalDate eventDate, int daysAhead) {
        List<User> eventUsers = automaticMailPreferenceRepository.findEventUsers();

        for (ExtraDate event : extraDateRepository.findByExtraDate(eventDate)) {
            for (User user : filterUsersByEventRoles(eventUsers, event)) {
                if (!canSendTo(user)) {
                    continue;
                }
                digestFor(digestsByUserId, user).add(
                        "Eventos",
                        String.format(
                                "El evento '%s' esta programado en %s dias, el %s.",
                                event.getDescription() == null || event.getDescription().isBlank()
                                        ? "Evento sin descripcion"
                                        : event.getDescription(),
                                daysAhead,
                                eventDate
                        )
                );
            }
        }
    }

    private NotificationSettings getOrCreateSettings() {
        return notificationSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> {
                    NotificationSettings settings = new NotificationSettings();
                    settings.setId(SETTINGS_ID);
                    return notificationSettingsRepository.save(settings);
                });
    }

    private NotificationDigest digestFor(Map<Integer, NotificationDigest> digestsByUserId, User user) {
        return digestsByUserId.computeIfAbsent(user.getId(), ignored -> new NotificationDigest(user));
    }

    private List<User> operationRecipients(Operation operation) {
        Map<Integer, User> recipientsById = new LinkedHashMap<>();
        if (operation.getCreador() != null) {
            recipientsById.put(operation.getCreador().getId(), operation.getCreador());
        }
        if (operation.getAssignedUsers() != null) {
            for (User user : operation.getAssignedUsers()) {
                recipientsById.putIfAbsent(user.getId(), user);
            }
        }
        return recipientsById.values().stream().toList();
    }

    private List<User> filterUsersByEventRoles(List<User> users, ExtraDate event) {
        if (event.getRoles() == null || event.getRoles().isEmpty()) {
            return users;
        }
        Set<String> eventRoles = event.getRoles().stream().collect(Collectors.toSet());
        return users.stream()
                .filter(user -> user.getEffectiveRoles().stream().anyMatch(role -> eventRoles.contains(role.name())))
                .toList();
    }

    private boolean canSendTo(User user, Set<Integer> enabledUserIds) {
        return canSendTo(user) && enabledUserIds.contains(user.getId());
    }

    private boolean canSendTo(User user) {
        return user != null
                && user.isState()
                && user.getEmail() != null
                && !user.getEmail().isBlank();
    }

    private void sendDigestEmail(NotificationDigest digest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(digest.user().getEmail());
            message.setSubject("Resumen de notificaciones DroneGestory");
            message.setText(digest.toMailText());
            mailSender.send(message);
            System.out.println("Notification digest sent to: " + digest.user().getEmail());
        } catch (Exception e) {
            System.err.println("Error sending notification digest to " + digest.user().getEmail() + ": " + e.getMessage());
        }
    }

    private record NotificationDigest(User user, Map<String, List<String>> sections) {
        private NotificationDigest(User user) {
            this(user, new LinkedHashMap<>());
        }

        private void add(String section, String line) {
            sections.computeIfAbsent(section, ignored -> new ArrayList<>()).add(line);
        }

        private boolean hasNotifications() {
            return sections.values().stream().anyMatch(items -> !items.isEmpty());
        }

        private String toMailText() {
            StringBuilder builder = new StringBuilder();
            builder.append("Hola ").append(user.getFirstName()).append(",\n\n");
            builder.append("Tienes las siguientes notificaciones:\n\n");
            sections.forEach((section, lines) -> {
                builder.append(section).append(":\n");
                for (String line : lines) {
                    builder.append("- ").append(line).append("\n");
                }
                builder.append("\n");
            });
            builder.append("Saludos,\nDroneGestory Team");
            return builder.toString();
        }
    }
}
