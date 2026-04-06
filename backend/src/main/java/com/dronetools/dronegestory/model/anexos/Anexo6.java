package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "anexo6")
@Getter
@Setter
public class Anexo6 extends Anexo {

    // Solo campo de prueba
    @Column(name = "texto_prueba")
    private String textoPrueba;

    public Anexo6() {
        super();
        this.setTipoAnexo(6);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}