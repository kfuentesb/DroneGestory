package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "user_certificate")
@Getter
@Setter
@NoArgsConstructor
public class UserCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_certificate_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "certificate_type")
    private String certificateType;

    @Column(name = "certificate_name")
    private String certificateName;

    @Column(name = "expire_date")
    private LocalDate expireDate;

    @Column(name = "date_indefinite")
    private Boolean dateIndefinite;
}
