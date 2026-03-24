package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.enums.UserType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.time.LocalDate;

@Entity
@Table(name = "app_user")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class User implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

//    @ManyToOne
//    @JoinColumn(name = "operator_id", nullable = false)
//    private Operator operator;

    @Column(name = "type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private UserType type;

    // por defecto está activo el estado, tampoco se pide como campo en el registro
    @Column(name = "state", nullable = false)
    private boolean state = true;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 150)
    private String lastName;

    @Column(name = "username", nullable = false, unique = true, length = 80)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "doc_identidad", nullable = false, unique = true, length = 120)
    private String docIdentidad;

    @Column(name = "phone_number")
    private Integer phoneNumber; // TODO cambiar a string

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "fecha_nac")
    @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
    private LocalDate fechaNac;

//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    private java.util.List<Operation> operations;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + type.name()));
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
