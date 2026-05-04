package com.dronetools.dronegestory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
public class NotificationSettings {

    @Id
    @Column(name = "notification_settings_id")
    private Integer id = 1;

    @Column(name = "schedule_hour", nullable = false)
    private Integer scheduleHour = 9;

    @Column(name = "schedule_minute", nullable = false)
    private Integer scheduleMinute = 0;

    @Column(name = "certificate_first_days_ahead", nullable = false)
    private Integer certificateFirstDaysAhead = 30;

    @Column(name = "certificate_second_days_ahead", nullable = false)
    private Integer certificateSecondDaysAhead = 7;

    @Column(name = "operation_days_ahead", nullable = false)
    private Integer operationDaysAhead = 1;

    @Column(name = "maintenance_days_ahead", nullable = false)
    private Integer maintenanceDaysAhead = 1;

    @Column(name = "event_days_ahead", nullable = false)
    private Integer eventDaysAhead = 1;

    @Column(name = "last_run_date")
    private LocalDate lastRunDate;
}
