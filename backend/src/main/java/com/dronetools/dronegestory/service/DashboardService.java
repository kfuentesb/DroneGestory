package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.DashboardAircraftDocumentationExpiryDTO;
import com.dronetools.dronegestory.dto.DashboardBirthdayDTO;
import com.dronetools.dronegestory.dto.DashboardCertificateExpiryDTO;
import com.dronetools.dronegestory.dto.DashboardDTO;
import com.dronetools.dronegestory.dto.DashboardMaintenanceDateDTO;
import com.dronetools.dronegestory.dto.DashboardOperationDTO;
import com.dronetools.dronegestory.dto.ExtraDateDTO;
import com.dronetools.dronegestory.model.AircraftDocumentation;
import com.dronetools.dronegestory.model.ExtraDate;
import com.dronetools.dronegestory.model.Maintenance;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.AircraftDocumentationRepository;
import com.dronetools.dronegestory.repository.AircraftRepository;
import com.dronetools.dronegestory.repository.ExtraDateRepository;
import com.dronetools.dronegestory.repository.MaintenanceRepository;
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
        @Autowired private MaintenanceRepository maintenanceRepo;
        @Autowired private UserService userService;
        @Autowired private ExtraDateRepository extraDateRepository;

        public DashboardDTO getDashboard() {
                DashboardDTO dto = new DashboardDTO();
                

                dto.setTotalOperaciones(operationRepo.count());
                dto.setTotalPilotos(userRepo.countByRoleAndStateTrue(UserType.PILOT));
                dto.setTotalUsuarios(userRepo.count());
                dto.setTotalDocumentacionUsuarios(userCertificateRepository.count());
                dto.setTotalDrones(aircraftRepo.count());
                dto.setTotalMantenimientos(maintenanceRepo.count());
                dto.setTotalDocumentacionAeronaves(aircraftDocumentationRepository.count());

                dto.setOperations(mapOperations(operationRepo.findAllWithAnexos4()));
                
                List<User> usersWithBirthday = userRepo.findAllWithBirthday();
                dto.setBirthdays(mapBirthdays(usersWithBirthday));

                List<Maintenance> maintenanceList = maintenanceRepo.findAll(); 
                dto.setMaintenance(mapMaintenance(maintenanceList));

                User currentUser = userService.getAuthenticatedUser();
                if (isPrivileged(currentUser)) {
                dto.setCertificateExpirations(mapCertificateExpirations(
                        userCertificateRepository.findAllExpiringWithUser()));
                dto.setAircraftDocumentationExpirations(mapAircraftDocumentationExpirations(
                        aircraftDocumentationRepository.findAllInsuranceExpiringWithAircraft()));
                } else {
                dto.setCertificateExpirations(mapCertificateExpirations(
                        userCertificateRepository.findAllExpiringWithUserByUserId(currentUser.getId())));
                }

                List<ExtraDate> extraEvents = extraDateRepository.findAll();
                dto.setExtraEvents(extraEvents.stream()
                        .map(e -> new ExtraDateDTO(e.getIdExtraDate(), e.getExtraDate(), e.getDescription()))
                        .toList());

                return dto;
        }

        private List<DashboardMaintenanceDateDTO> mapMaintenance(List<Maintenance> items) {
                return items.stream()
                        .map(m -> {
                                java.time.LocalDate maintenanceDate = null;
                                if (m.getMaintenanceDate() != null) {
                                        maintenanceDate = new java.sql.Date(m.getMaintenanceDate().getTime()).toLocalDate();
                                }

                                java.time.LocalDate nextMaintenanceDate = null;
                                if (m.getNextMaintenanceDate() != null) {
                                        nextMaintenanceDate = new java.sql.Date(m.getNextMaintenanceDate().getTime()).toLocalDate();
                                }

                                return new DashboardMaintenanceDateDTO(
                                        m.getAircraft().getAircraftId(),
                                        maintenanceDate,
                                        nextMaintenanceDate,
                                        m.getReviewType(),          
                                        m.getAircraft().getSerialNumber(),
                                        m.getAircraft().getAircraftModel().getManufacturer(),
                                        m.getAircraft().getAircraftModel().getModel()
                                );
                        })
                        .toList();
        }

        private List<DashboardCertificateExpiryDTO> mapCertificateExpirations(List<UserCertificate> certificates) {
                return certificates.stream()
                        .map(certificate -> new DashboardCertificateExpiryDTO(
                                certificate.getUser().getId(),
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
                                user.getId(),
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
                                documentation.getAircraft().getAircraftId(),
                                documentation.getExpireDate(),
                                documentation.getDocumentationType(),
                                documentation.getAircraft().getSerialNumber(),
                                documentation.getAircraft().getAircraftModel().getManufacturer(),
                                documentation.getAircraft().getAircraftModel().getModel()
                        ))
                        .toList();
        }

        private List<DashboardOperationDTO> mapOperations(List<Operation> operations) {
                return operations.stream()
                        .map(operation -> {
                                if (operation.getAnexo4Actual() == null) {
                                        return null;
                                }
                                if (operation.getAnexo4Actual().getFechaHoraPrevista() == null) {
                                        return null;
                                }
                                return new DashboardOperationDTO(
                                        operation.getIdOperacion(),
                                        operation.getCodigo(),
                                        operation.getAnexo4Actual().getFechaHoraPrevista()
                                );
                        })
                        .filter(item -> item != null)
                        .toList();
        }

        private boolean isPrivileged(User user) {
                return user.getEffectiveRoles().contains(UserType.ADMIN)
                        || user.getEffectiveRoles().contains(UserType.MANAGER);
        }

        }
