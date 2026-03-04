package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userID;

    @Column(name = "operator_id")
    private Integer operatorID;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "last_names", nullable = false, length = 150)
    private String lastNames;

    @Column(name = "username", nullable = false, unique = true, length = 80)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "path_imagen", length = 255)
    private String pathImagen;

}