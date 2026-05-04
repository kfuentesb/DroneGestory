package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.NotificationSettingsRequest;
import com.dronetools.dronegestory.dto.NotificationSettingsResponse;
import com.dronetools.dronegestory.model.NotificationSettings;
import com.dronetools.dronegestory.repository.NotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationSettingsService {

    private static final int SETTINGS_ID = 1;

    private final NotificationSettingsRepository notificationSettingsRepository;

    @Transactional
    public NotificationSettings getOrCreateEntity() {
        return notificationSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> {
                    NotificationSettings settings = new NotificationSettings();
                    settings.setId(SETTINGS_ID);
                    // Valores por defecto opcionales
                    settings.setScheduleHour(9);
                    settings.setScheduleMinute(0); 
                    return notificationSettingsRepository.save(settings);
                });
    }

    @Transactional(readOnly = true)
    public NotificationSettingsResponse find() {
        return toResponse(getOrCreateEntity());
    }

    @Transactional
    public NotificationSettingsResponse update(NotificationSettingsRequest request) {
        NotificationSettings settings = getOrCreateEntity();
        
        // Actualizamos hora y minutos
        settings.setScheduleHour(request.scheduleHour());
        settings.setScheduleMinute(request.scheduleMinute()); // <--- NUEVO
        
        settings.setCertificateFirstDaysAhead(request.certificateFirstDaysAhead());
        settings.setCertificateSecondDaysAhead(request.certificateSecondDaysAhead());
        settings.setOperationDaysAhead(request.operationDaysAhead());
        settings.setMaintenanceDaysAhead(request.maintenanceDaysAhead());
        settings.setEventDaysAhead(request.eventDaysAhead());
        
        return toResponse(notificationSettingsRepository.save(settings));
    }

    private NotificationSettingsResponse toResponse(NotificationSettings settings) {
        return new NotificationSettingsResponse(
                settings.getScheduleHour(),
                settings.getScheduleMinute(), // <--- NUEVO
                settings.getCertificateFirstDaysAhead(),
                settings.getCertificateSecondDaysAhead(),
                settings.getOperationDaysAhead(),
                settings.getMaintenanceDaysAhead(),
                settings.getEventDaysAhead(),
                settings.getLastRunDate()
        );
    }
}