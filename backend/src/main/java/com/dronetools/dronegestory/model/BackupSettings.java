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
@Table(name = "backup_settings")
@Getter
@Setter
@NoArgsConstructor
public class BackupSettings {

    @Id
    @Column(name = "backup_settings_id")
    private Integer id = 1;

    @Column(name = "schedule_day", nullable = false)
    private Integer scheduleDay = 1;

    @Column(name = "schedule_hour", nullable = false)
    private Integer scheduleHour = 2;

    @Column(name = "last_run_date")
    private LocalDate lastRunDate;

    @Column(name = "last_backup_path")
    private String lastBackupPath;
}
