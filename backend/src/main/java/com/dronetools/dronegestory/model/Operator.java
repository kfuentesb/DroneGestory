package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "operators")
@Getter
@Setter
@NoArgsConstructor
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "operator_id")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "fiscal_id")
    private Integer fiscalId;

    @Column(name = "operator_number")
    private Integer operatorNumber;

    @Column(name = "rid_secret_code")
    private Integer ridSecretCode;

    @Column(name = "easa_certificate_path")
    private String easaCertificatePath;

    @Column(name = "non_easa_certificate_path")
    private String nonEasaCertificatePath;

    @Column(name = "address")
    private String address;

    @Column(name = "postal_code")
    private Integer postalCode;

    @Column(name = "city")
    private String city;

    @Column(name = "province")
    private String province;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private Integer phoneNumber;

    @OneToMany(mappedBy = "operator")
    private List<User> users;

    @OneToMany(mappedBy = "operator")
    private List<Aircraft> aircraft;
}