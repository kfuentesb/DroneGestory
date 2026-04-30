package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.enums.UserType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sent_mail")
@Getter
@Setter
@NoArgsConstructor
public class SentMail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sent_mail_id")
    private Long id;

    @Column(name = "sender_username", nullable = false, length = 80)
    private String username;

    @Column(name = "header", nullable = false, length = 180)
    private String header;

    @Column(name = "body_text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "recipient_mode", nullable = false, length = 20)
    private String recipientMode;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sent_mail_selected_users", joinColumns = @JoinColumn(name = "sent_mail_id"))
    @Column(name = "username", nullable = false, length = 80)
    private List<String> selectedUsernames = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sent_mail_selected_roles", joinColumns = @JoinColumn(name = "sent_mail_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private List<UserType> selectedRoles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sent_mail_recipients", joinColumns = @JoinColumn(name = "sent_mail_id"))
    @Column(name = "recipient", nullable = false, length = 140)
    private List<String> recipients = new ArrayList<>();

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
}
