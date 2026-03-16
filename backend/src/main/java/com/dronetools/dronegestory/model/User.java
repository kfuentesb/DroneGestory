package com.dronetools.dronegestory.model;

import com.dronetools.dronegestory.model.enums.UserType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "app_user")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class User {

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

    @Column(name = "phone_number")
    private Integer phoneNumber;

    @Column(name = "image_path")
    private String imagePath;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private java.util.List<Operation> operations;
}
