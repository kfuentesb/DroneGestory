package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "anexo5")
@Getter
@Setter
public class Anexo5 extends Anexo {

    @Column(name = "texto_prueba")
    private String textoPrueba;

    public Anexo5() {
        super();
        this.setTipoAnexo(5);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}