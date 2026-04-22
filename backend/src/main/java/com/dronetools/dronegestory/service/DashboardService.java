package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.DashboardAircraftDocumentationExpiryDTO;
import com.dronetools.dronegestory.dto.DashboardBirthdayDTO;
import com.dronetools.dronegestory.dto.DashboardCertificateExpiryDTO;
import com.dronetools.dronegestory.dto.DashboardDTO;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dronetools.dronegestory.model.enums.UserType;

import java.util.List;

@Service
public class DashboardService {
    @Autowired private OperationRepository operationRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AircraftRepository aircraftRepo;
    @Autowired private AircraftDocumentationRepository aircraftDocumentationRepository;
    @Autowired private UserCertificateRepository userCertificateRepository;
    @Autowired private UserService userService;

    public DashboardDTO getDashboard() {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalOperaciones(operationRepo.count());
        dto.setTotalPilotos(userRepo.countByRoleAndStateTrue(UserType.PILOT));
        dto.setTotalUsuarios(userRepo.count());
        dto.setTotalDrones(aircraftRepo.count());
        dto.setBirthdays(mapBirthdays(userRepo.findAllWithBirthday()));

        User currentUser = userService.getAuthenticatedUser();
        if (isPrivileged(currentUser)) {
            dto.setCertificateExpirations(mapCertificateExpirations(userCertificateRepository.findAllExpiringWithUser()));
            dto.setAircraftDocumentationExpirations(mapAircraftDocumentationExpirations(
                    aircraftDocumentationRepository.findAllInsuranceExpiringWithAircraft()
            ));
        } else {
            dto.setCertificateExpirations(mapCertificateExpirations(
                    userCertificateRepository.findAllExpiringWithUserByUserId(currentUser.getId())
            ));
        }

        return dto;
    }

    private List<DashboardCertificateExpiryDTO> mapCertificateExpirations(List<UserCertificate> certificates) {
        return certificates.stream()
                .map(certificate -> new DashboardCertificateExpiryDTO(
                        certificate.getExpireDate(),
                        certificate.getUser().getFirstName(),
                        certificate.getUser().getLastName(),
                        certificate.getUser().getUsername(),
                        certificate.getCertificateName(),
                        certificate.getCertificateType()
                ))
                .toList();
    }

    private List<DashboardBirthdayDTO> mapBirthdays(List<User> users) {
        return users.stream()
                .map(user -> new DashboardBirthdayDTO(
                        user.getFechaNac(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getUsername()
                ))
                .toList();
    }

    private List<DashboardAircraftDocumentationExpiryDTO> mapAircraftDocumentationExpirations(List<AircraftDocumentation> documentations) {
        return documentations.stream()
                .map(documentation -> new DashboardAircraftDocumentationExpiryDTO(
                        documentation.getExpireDate(),
                        documentation.getDocumentationType(),
                        documentation.getAircraft().getSerialNumber(),
                        documentation.getAircraft().getAircraftModel().getManufacturer(),
                        documentation.getAircraft().getAircraftModel().getModel()
                ))
                .toList();
    }

    private boolean isPrivileged(User user) {
        return user.getEffectiveRoles().contains(UserType.ADMIN)
                || user.getEffectiveRoles().contains(UserType.MANAGER);
    }
}
