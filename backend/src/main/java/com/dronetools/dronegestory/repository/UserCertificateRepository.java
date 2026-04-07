package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.UserCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCertificateRepository extends JpaRepository<UserCertificate, Integer> {
    List<UserCertificate> findByUserId(Integer userId);
    void deleteByUserId(Integer userId);
}
