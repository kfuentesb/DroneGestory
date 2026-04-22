package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AircraftDocumentation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AircraftDocumentationRepository extends JpaRepository<AircraftDocumentation, Long> {
    // Spring will now look for aircraft.aircraftId
    void deleteByAircraft_AircraftId(Long aircraftId);
    List<AircraftDocumentation> findByAircraft_AircraftId(Long aircraftId);
    List<AircraftDocumentation> findByModelDocumentation_Id(Long modelDocumentationId);

    @Query("""
            select ad
            from AircraftDocumentation ad
            join fetch ad.aircraft a
            join fetch a.aircraftModel am
            where ad.expireDate is not null
              and (ad.dateIndefinite = false or ad.dateIndefinite is null)
              and lower(ad.documentationType) = 'seguroresponsabilidadcivil'
            order by ad.expireDate asc, am.manufacturer asc, am.model asc, a.serialNumber asc
            """)
    List<AircraftDocumentation> findAllInsuranceExpiringWithAircraft();
}
