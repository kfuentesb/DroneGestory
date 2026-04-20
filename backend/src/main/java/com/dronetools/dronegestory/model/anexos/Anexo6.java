package com.dronetools.dronegestory.model.anexos;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "anexo6")
@Getter
@Setter
public class Anexo6 extends Anexo {

    // Solo campo de prueba
    @Column(name = "nombre_conops")
    private String nombreConops;

    @Column(name = "fechaOp")
    private LocalDateTime fechaOp;

    @Column(name = "serial_aeronave")
    private String serialAeronave;

    // 1. Material auxiliar
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "anexo6_materiales_auxiliares",
            joinColumns = @JoinColumn(name = "anexo6_id") // anexo6_id es clave foránea a anexo6.id
    )
    @Column(name = "material_auxiliar") // nombre de la columna para cada string
    private List<String> materialesAuxiliares = new ArrayList<>();

    // BOOLEANS - CORRECTO, INCORRECTO, NA
    // 2. Estructura
    private Boolean sinImpacto;
    private Boolean centroGravedad;
    private Boolean integridadEstructural;
    private Boolean cableado;
    private Boolean verificacionLuces;
    // 3. Sensores
    private Boolean calibracion;
    private Boolean validarSalidaDatos;
    // 4. Motores
    private Boolean giranLibremente;
    private Boolean sentidoGiroCorrecto;
    private Boolean sinImpactoMotores;
    // 5. Hélices
    private Boolean colocacionCorrecta;
    private Boolean sujetacionFirme;
    private Boolean sinImpactoHelices;
    // 6. Unidad de control
    private Boolean bateriaCarga;
    private Boolean movimientoFluidoMando;
    // 7. Partes móviles
    private Boolean sinImpactoPartesMoviles;
    private Boolean movimientoFluidoPartesMoviles;
    // 8. Comunicaciones
    private Boolean antenasInstaladasYOrientadas;
    private Boolean calidadOnda;
    private Boolean recepcionAdecuada;
    // 9. Planta de potencia
    private Boolean fuenteAlimentacion;
    private Boolean nivelFuenteAlimentacion;
    // 10. Carga de pago
    private Boolean fijacionCorrecta;
    private Boolean memoriaSuficienteParaDatos;
    private Boolean sinImpactoCargaPago;
    private Boolean conexionesCargaPago;
    // 11. Identificacion remota
    private Boolean datosCargados;
    private Boolean transmisionDatos;
    // 12. Sistema de geoconsciencia
    private Boolean informacionActualizada;
    private Boolean sistemaActivado;
    // 13. Conops
    // 13.1 Revisión de elementos auxiliares
    // TODO campo otros

    public Anexo6() {
        super();
        this.setTipoAnexo(6);
        this.setEstado(AnexoStatus.BORRADOR);
    }
}
