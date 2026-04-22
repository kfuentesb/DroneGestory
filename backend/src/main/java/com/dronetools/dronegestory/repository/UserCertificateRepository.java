package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.UserCertificate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserCertificateRepository extends JpaRepository<UserCertificate, Integer> {
    List<UserCertificate> findByUserId(Integer userId);

    @Query("""
            select uc
            from UserCertificate uc
            join fetch uc.user u
            where u.id = :userId
              and uc.expireDate is not null
              and (uc.dateIndefinite = false or uc.dateIndefinite is null)
            order by uc.expireDate asc, uc.certificateType asc, uc.certificateName asc
            """)
    List<UserCertificate> findAllExpiringWithUserByUserId(@Param("userId") Integer userId);

    @Query("""
            select uc
            from UserCertificate uc
            join fetch uc.user u
            where uc.expireDate is not null
              and (uc.dateIndefinite = false or uc.dateIndefinite is null)
            order by uc.expireDate asc, u.lastName asc, u.firstName asc, u.username asc
            """)
    List<UserCertificate> findAllExpiringWithUser();

    void deleteByUserId(Integer userId);
}
