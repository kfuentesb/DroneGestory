package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;
import java.time.LocalDateTime;
import java.util.List;

public record SentMailResponse(
        Long id,
        String username,
        String header,
        String text,
        String recipientMode,
        List<String> selectedUsernames,
        List<UserType> selectedRoles,
        List<String> recipients,
        LocalDateTime sentAt
) {
}
