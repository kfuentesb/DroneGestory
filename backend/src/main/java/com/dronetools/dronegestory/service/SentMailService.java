package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.SentMailRequest;
import com.dronetools.dronegestory.dto.SentMailResponse;
import com.dronetools.dronegestory.model.SentMail;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.AutomaticMailCategory;
import com.dronetools.dronegestory.model.enums.UserType;
import com.dronetools.dronegestory.repository.AutomaticMailPreferenceRepository;
import com.dronetools.dronegestory.repository.SentMailRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
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
    private static final String MODE_BOTH = "BOTH";

    private final SentMailRepository sentMailRepository;
    private final UserRepository userRepository;
    private final AutomaticMailPreferenceRepository automaticMailPreferenceRepository;
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
        List<User> selectedUsers = resolveSelectedUsers(request);
        List<User> roleUsers = resolveRoleUsers(request);
        List<User> recipients = filterByAutomaticPreference(
                mergeRecipients(selectedUsers, roleUsers),
                request.automaticCategory()
        );
        String mode = resolveStoredMode(selectedUsers, selectedRoles(request));
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
        sentMail.setSelectedUsernames(selectedUsers.stream().map(User::getUsername).toList());
        sentMail.setSelectedRoles(selectedRoles(request));
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

    @Transactional(readOnly = true)
    public List<User> resolveAutomaticRecipients(AutomaticMailCategory category) {
        return switch (category) {
            case CERTIFICATES -> automaticMailPreferenceRepository.findCertificateUsers();
            case OPERATIONS -> automaticMailPreferenceRepository.findOperationUsers();
            case MAINTENANCE -> automaticMailPreferenceRepository.findMaintenanceUsers();
            case EVENTS -> automaticMailPreferenceRepository.findEventUsers();
        };
    }

    private List<User> filterByAutomaticPreference(List<User> recipients, AutomaticMailCategory category) {
        if (category == null || recipients.isEmpty()) {
            return recipients;
        }
        Set<Integer> allowedUserIds = resolveAutomaticRecipients(category).stream()
                .map(User::getId)
                .collect(java.util.stream.Collectors.toSet());
        return recipients.stream()
                .filter(user -> allowedUserIds.contains(user.getId()))
                .toList();
    }

    private List<User> resolveSelectedUsers(SentMailRequest request) {
        List<Integer> userIds = request.userIds() == null ? List.of() : request.userIds();
        if (userIds.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllById(userIds).stream()
                .filter(User::isState)
                .sorted(Comparator.comparing(User::getUsername))
                .toList();
    }

    private List<User> resolveRoleUsers(SentMailRequest request) {
        Set<UserType> roles = new LinkedHashSet<>(request.roles() == null ? List.of() : request.roles());
        if (roles.isEmpty()) {
            return List.of();
        }
        return userRepository.findActiveUsersByAnyRole(roles).stream()
                .sorted(Comparator.comparing(User::getUsername))
                .toList();
    }

    private List<User> mergeRecipients(List<User> selectedUsers, List<User> roleUsers) {
        Map<Integer, User> recipientsById = new java.util.LinkedHashMap<>();
        for (User user : selectedUsers) {
            recipientsById.put(user.getId(), user);
        }
        for (User user : roleUsers) {
            recipientsById.putIfAbsent(user.getId(), user);
        }
        return new ArrayList<>(recipientsById.values()).stream()
                .sorted(Comparator.comparing(User::getUsername))
                .toList();
    }

    private String resolveStoredMode(List<User> selectedUsers, List<UserType> selectedRoles) {
        if (!selectedUsers.isEmpty() && !selectedRoles.isEmpty()) {
            return MODE_BOTH;
        }
        return selectedUsers.isEmpty() ? MODE_ROLES : MODE_USERS;
    }

    private List<UserType> selectedRoles(SentMailRequest request) {
        if (request.roles() == null) {
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
                List.copyOf(sentMail.getSelectedUsernames()),
                List.copyOf(sentMail.getSelectedRoles()),
                List.copyOf(sentMail.getRecipients()),
                sentMail.getSentAt()
        );
    }
}
