package com.dronetools.dronegestory.model.anexos;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PersonalExterno {

    @Column(name = "nombre_apellidos", length = 255)
    private String nombreApellidos;

    @Column(name = "rol", length = 255)
    private String rol;
}
