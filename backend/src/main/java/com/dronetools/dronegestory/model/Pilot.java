package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "pilot")
@NoArgsConstructor
@AllArgsConstructor
public class Pilot extends User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pilot_id")
    private Long pilotId;

    @Id
    @Column(name = "userID")
    private String userID;
}
