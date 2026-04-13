package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.DashboardDTO;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.PilotRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dronetools.dronegestory.model.enums.UserType;

@Service
public class DashboardService {
    @Autowired private OperationRepository operationRepo;
    @Autowired private PilotRepository pilotRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AircraftRepository aircraftRepo;

    public DashboardDTO getDashboard() {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalOperaciones(operationRepo.count());
        dto.setTotalPilotos(userRepo.countByTypeAndStateTrue(UserType.PILOT));
        dto.setTotalUsuarios(userRepo.count());
        dto.setTotalDrones(aircraftRepo.count());
        return dto;
    }
}
