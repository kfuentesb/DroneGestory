package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Anexo6ResponseDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String nombreConops;
    private LocalDateTime fechaOp;
    private Long aircraftId;
    private List<String> materialesAuxiliares;

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

    public static Anexo6ResponseDTO fromEntity(Anexo6 anexo) {
        Anexo6ResponseDTO dto = new Anexo6ResponseDTO();
        dto.setId(anexo.getId());
        dto.setNumeroVersion(anexo.getNumeroVersion());
        dto.setEstado(anexo.getEstado());
        dto.setNombreConops(anexo.getNombreConops());
        dto.setFechaOp(anexo.getFechaOp());
        dto.setAircraftId(anexo.getAircraftId());
        dto.setMaterialesAuxiliares(
                anexo.getMaterialesAuxiliares() == null ? List.of() : new ArrayList<>(anexo.getMaterialesAuxiliares())
        );
        dto.setSinImpacto(anexo.getSinImpacto());
        dto.setCentroGravedad(anexo.getCentroGravedad());
        dto.setIntegridadEstructural(anexo.getIntegridadEstructural());
        dto.setCableado(anexo.getCableado());
        dto.setVerificacionLuces(anexo.getVerificacionLuces());
        dto.setCalibracion(anexo.getCalibracion());
        dto.setValidarSalidaDatos(anexo.getValidarSalidaDatos());
        dto.setGiranLibremente(anexo.getGiranLibremente());
        dto.setSentidoGiroCorrecto(anexo.getSentidoGiroCorrecto());
        dto.setSinImpactoMotores(anexo.getSinImpactoMotores());
        dto.setColocacionCorrecta(anexo.getColocacionCorrecta());
        dto.setSujetacionFirme(anexo.getSujetacionFirme());
        dto.setSinImpactoHelices(anexo.getSinImpactoHelices());
        dto.setBateriaCarga(anexo.getBateriaCarga());
        dto.setMovimientoFluidoMando(anexo.getMovimientoFluidoMando());
        dto.setSinImpactoPartesMoviles(anexo.getSinImpactoPartesMoviles());
        dto.setMovimientoFluidoPartesMoviles(anexo.getMovimientoFluidoPartesMoviles());
        dto.setAntenasInstaladasYOrientadas(anexo.getAntenasInstaladasYOrientadas());
        dto.setCalidadOnda(anexo.getCalidadOnda());
        dto.setRecepcionAdecuada(anexo.getRecepcionAdecuada());
        dto.setFuenteAlimentacion(anexo.getFuenteAlimentacion());
        dto.setNivelFuenteAlimentacion(anexo.getNivelFuenteAlimentacion());
        dto.setFijacionCorrecta(anexo.getFijacionCorrecta());
        dto.setMemoriaSuficienteParaDatos(anexo.getMemoriaSuficienteParaDatos());
        dto.setSinImpactoCargaPago(anexo.getSinImpactoCargaPago());
        dto.setConexionesCargaPago(anexo.getConexionesCargaPago());
        dto.setDatosCargados(anexo.getDatosCargados());
        dto.setTransmisionDatos(anexo.getTransmisionDatos());
        dto.setInformacionActualizada(anexo.getInformacionActualizada());
        dto.setSistemaActivado(anexo.getSistemaActivado());
        return dto;
    }
}
