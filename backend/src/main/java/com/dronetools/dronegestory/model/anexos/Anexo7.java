package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "anexo7")
@Getter
@Setter
public class Anexo7 extends Anexo {
    
    @Column(name = "texto_prueba")
    private String textoPrueba;

    public Anexo7() {
        super();
        this.setTipoAnexo(7);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
