package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "operator")
public class Operator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String taxID;
    private Integer operatorNumber;
    private Integer secretNumberRid;
    private String path_certification_easa;
    private String path_certification_no_easa;
    private String address;
    private Integer postalNumber;
    private String population;
    private String provincia;
    private String email;
    private Integer phone;

}
