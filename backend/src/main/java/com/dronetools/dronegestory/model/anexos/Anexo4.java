package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "anexo4")
@Getter
@Setter
public class Anexo4 extends Anexo {

    // Solo campo de prueba
    @Column(name = "texto_prueba")
    private String textoPrueba;

    public Anexo4() {
        super();
        this.setTipoAnexo(4);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}