package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.sql.Date;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findAllByOrderByMaintenanceDateDescMaintenanceIdDesc();
    List<Maintenance> findByAircraft_AircraftIdOrderByMaintenanceDateDescMaintenanceIdDesc(Long aircraftId);
    List<Maintenance> findByNextMaintenanceDate(Date nextMaintenanceDate);
}
