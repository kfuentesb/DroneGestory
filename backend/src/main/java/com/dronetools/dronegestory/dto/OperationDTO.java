package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.Operation;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OperationDTO {
    private Long idOperacion;
    private String nombreOperacion;
    private String nombreCreador; // agregar este campo


    public OperationDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.nombreOperacion = op.getNombreOperacion();
        // Aquí puedes usar getNombre() o getUsername() según tu User
        this.nombreCreador = op.getCreador().getFirstName()
                + " " + op.getCreador().getLastName();
    }
}
