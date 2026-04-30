package com.dronetools.dronegestory.repository;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);

    @Query("select count(distinct u) from User u join u.roles r where u.state = true and r = :role")
    long countByRoleAndStateTrue(@Param("role") UserType role);

    @Query("select distinct u from User u join u.roles r where u.state = true and r in :roles")
    List<User> findActiveUsersByAnyRole(@Param("roles") Set<UserType> roles);

    @Query("""
            select u
            from User u
            where u.fechaNac is not null
            order by month(u.fechaNac) asc, day(u.fechaNac) asc, u.lastName asc, u.firstName asc, u.username asc
            """)
    List<User> findAllWithBirthday();
}
