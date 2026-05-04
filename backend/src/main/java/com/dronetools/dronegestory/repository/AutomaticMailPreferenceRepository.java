package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.AutomaticMailPreference;
import com.dronetools.dronegestory.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AutomaticMailPreferenceRepository extends JpaRepository<AutomaticMailPreference, Long> {
    Optional<AutomaticMailPreference> findByUserId(Integer userId);

    @Query("select p.user from AutomaticMailPreference p where p.user.state = true and p.certificates = true")
    List<User> findCertificateUsers();

    @Query("select p.user from AutomaticMailPreference p where p.user.state = true and p.operations = true")
    List<User> findOperationUsers();

    @Query("select p.user from AutomaticMailPreference p where p.user.state = true and p.maintenance = true")
    List<User> findMaintenanceUsers();

    @Query("select p.user from AutomaticMailPreference p where p.user.state = true and p.events = true")
    List<User> findEventUsers();
}
