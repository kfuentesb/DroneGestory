package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.SentMailRequest;
import com.dronetools.dronegestory.dto.SentMailResponse;
import com.dronetools.dronegestory.model.SentMail;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.UserType;
import com.dronetools.dronegestory.repository.SentMailRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SentMailService {

    private static final String MODE_USERS = "USERS";
    private static final String MODE_ROLES = "ROLES";

    private final SentMailRepository sentMailRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Transactional(readOnly = true)
    public List<SentMailResponse> findAll() {
        return sentMailRepository.findAll(Sort.by(Sort.Direction.DESC, "sentAt", "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SentMailResponse sendAndStore(String senderUsername, SentMailRequest request) {
        String mode = normalizeMode(request.recipientMode());
        List<User> recipients = resolveRecipients(mode, request);
        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("At least one recipient is required.");
        }

        List<String> recipientEmails = recipients.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .distinct()
                .toList();
        if (recipientEmails.isEmpty()) {
            throw new IllegalArgumentException("Selected recipients do not have email addresses.");
        }

        sendMail(request.header(), request.text(), recipientEmails);

        SentMail sentMail = new SentMail();
        sentMail.setUsername(senderUsername);
        sentMail.setHeader(request.header().trim());
        sentMail.setText(request.text().trim());
        sentMail.setRecipientMode(mode);
        sentMail.setSelectedUsernames(selectedUsernames(mode, recipients));
        sentMail.setSelectedRoles(selectedRoles(mode, request));
        sentMail.setRecipients(recipientSnapshots(recipients));
        sentMail.setSentAt(LocalDateTime.now());

        return toResponse(sentMailRepository.save(sentMail));
    }

    private void sendMail(String header, String text, List<String> recipientEmails) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setBcc(recipientEmails.toArray(String[]::new));
        message.setSubject(header.trim());
        message.setText(text.trim());
        mailSender.send(message);
    }

    private List<User> resolveRecipients(String mode, SentMailRequest request) {
        if (MODE_USERS.equals(mode)) {
            List<Integer> userIds = request.userIds() == null ? List.of() : request.userIds();
            return userRepository.findAllById(userIds).stream()
                    .filter(User::isState)
                    .sorted(Comparator.comparing(User::getUsername))
                    .toList();
        }

        Set<UserType> roles = new LinkedHashSet<>(request.roles() == null ? List.of() : request.roles());
        if (roles.isEmpty()) {
            return List.of();
        }
        return userRepository.findActiveUsersByAnyRole(roles).stream()
                .sorted(Comparator.comparing(User::getUsername))
                .toList();
    }

    private String normalizeMode(String mode) {
        if (mode == null) {
            throw new IllegalArgumentException("Recipient mode is required.");
        }
        String normalized = mode.trim().toUpperCase();
        if (!MODE_USERS.equals(normalized) && !MODE_ROLES.equals(normalized)) {
            throw new IllegalArgumentException("Recipient mode must be USERS or ROLES.");
        }
        return normalized;
    }

    private List<String> selectedUsernames(String mode, List<User> recipients) {
        if (!MODE_USERS.equals(mode)) {
            return List.of();
        }
        return recipients.stream()
                .map(User::getUsername)
                .toList();
    }

    private List<UserType> selectedRoles(String mode, SentMailRequest request) {
        if (!MODE_ROLES.equals(mode) || request.roles() == null) {
            return List.of();
        }
        return request.roles().stream().distinct().toList();
    }

    private List<String> recipientSnapshots(List<User> recipients) {
        return recipients.stream()
                .map(user -> "%s <%s>".formatted(user.getUsername(), user.getEmail()))
                .toList();
    }

    private SentMailResponse toResponse(SentMail sentMail) {
        return new SentMailResponse(
                sentMail.getId(),
                sentMail.getUsername(),
                sentMail.getHeader(),
                sentMail.getText(),
                sentMail.getRecipientMode(),
                sentMail.getSelectedUsernames(),
                sentMail.getSelectedRoles(),
                sentMail.getRecipients(),
                sentMail.getSentAt()
        );
    }
}
