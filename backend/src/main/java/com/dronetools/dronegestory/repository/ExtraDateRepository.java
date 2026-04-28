package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.ExtraDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExtraDateRepository extends JpaRepository<ExtraDate, Long> {
    // Para obtener los eventos de un mes específico en el calendario
    List<ExtraDate> findByExtraDateBetween(LocalDate start, LocalDate end);
    
    // Para obtener eventos de un día concreto
    List<ExtraDate> findByExtraDate(LocalDate date);
}