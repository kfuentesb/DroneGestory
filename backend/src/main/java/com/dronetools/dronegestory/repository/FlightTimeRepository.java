package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.FlightTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightTimeRepository extends JpaRepository<FlightTime, Long> {
    List<FlightTime> findAllByOrderByFlightDateDescFlightTimeIdDesc();
    List<FlightTime> findByAircraft_AircraftIdOrderByFlightDateDescFlightTimeIdDesc(Long aircraftId);
    List<FlightTime> findByAircraft_AircraftIdOrderByFlightDateAscFlightTimeIdAsc(Long aircraftId);
    Optional<FlightTime> findFirstByAircraft_AircraftIdOrderByFlightDateDescFlightTimeIdDesc(Long aircraftId);
    boolean existsByOperation_IdOperacionAndAircraft_AircraftId(Long operationId, Long aircraftId);
}
