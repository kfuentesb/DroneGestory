package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.UserCertificateDTO;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.UserCertificate;
import com.dronetools.dronegestory.repository.UserCertificateRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserCertificateService {

    private final UserCertificateRepository userCertificateRepository;
    private final UserRepository userRepository;

    public UserCertificateService(UserCertificateRepository userCertificateRepository, UserRepository userRepository) {
        this.userCertificateRepository = userCertificateRepository;
        this.userRepository = userRepository;
    }

    public List<UserCertificateDTO> findAll() {
        return userCertificateRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<UserCertificateDTO> findById(Integer id) {
        return userCertificateRepository.findById(id).map(this::toDto);
    }

    public List<UserCertificateDTO> findByUserId(Integer userId) {
        return userCertificateRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    public UserCertificateDTO create(UserCertificateDTO dto) {
        User user = resolveUser(dto.userId());

        UserCertificate certificate = new UserCertificate();
        certificate.setUser(user);
        certificate.setCertificateType(dto.certificateType());
        certificate.setCertificateName(dto.certificateName());
        certificate.setExpireDate(dto.expireDate());
        certificate.setDateIndefinite(dto.dateIndefinite());

        return toDto(userCertificateRepository.save(certificate));
    }

    public Optional<UserCertificateDTO> update(Integer id, UserCertificateDTO dto) {
        return userCertificateRepository.findById(id).map(existing -> {
            User user = resolveUser(dto.userId());
            existing.setUser(user);
            existing.setCertificateType(dto.certificateType());
            existing.setCertificateName(dto.certificateName());
            existing.setExpireDate(dto.expireDate());
            existing.setDateIndefinite(dto.dateIndefinite());
            return toDto(userCertificateRepository.save(existing));
        });
    }

    public void deleteById(Integer id) {
        if (!userCertificateRepository.existsById(id)) {
            throw new RuntimeException("User certificate not found with id: " + id);
        }
        userCertificateRepository.deleteById(id);
    }

    private User resolveUser(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    private UserCertificateDTO toDto(UserCertificate userCertificate) {
        return new UserCertificateDTO(
                userCertificate.getId(),
                userCertificate.getUser().getId(),
                userCertificate.getCertificateType(),
                userCertificate.getCertificateName(),
                userCertificate.getExpireDate(),
                userCertificate.getDateIndefinite()
        );
    }
}
