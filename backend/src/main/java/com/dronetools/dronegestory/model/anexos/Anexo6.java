package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;
import com.dronetools.dronegestory.model.Anexo;

@Entity
@Table(name = "anexo6")
@Getter
@Setter
// @NoArgsConstructor
public class Anexo6 extends Anexo {
    
    @Column(name = "texto_prueba")
    private String textoPrueba;

    public Anexo6() {
        super();
        this.setTipoAnexo(6);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
