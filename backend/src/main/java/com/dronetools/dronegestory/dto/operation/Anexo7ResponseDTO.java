package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo7ResponseDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String nombreConops;
    private LocalDateTime fechaOp;
    private Long aircraftId;
    private Integer tiempoVueloMinutos;
    private Integer ciclosAterrizaje;

    // 1. Verificación
    private Boolean estructuraCorrecto;
    private String estructuraObservaciones;

    private Boolean bateriasCorrecto;
    private String bateriasObservaciones;

    private Boolean sensoresCorrecto;
    private String sensoresObservaciones;

    private Boolean motoresCorrecto;
    private String motoresObservaciones;

    private Boolean helicesCorrecto;
    private String helicesObservaciones;

    private Boolean partesMovilesCorrecto;
    private String partesMovilesObservaciones;

    private Boolean comunicacionesCorrecto;
    private String comunicacionesObservaciones;

    private Boolean plantaPotenciaCorrecto;
    private String plantaPotenciaObservaciones;

    private Boolean cargaPagoCorrecto;
    private String cargaPagoObservaciones;

    private Boolean identificacionRemotaCorrecto;
    private String identificacionRemotaObservaciones;

    private Boolean sistemaGeoconscienciaCorrecto;
    private String sistemaGeoconscienciaObservaciones;

    private Boolean datosVueloCorrecto;
    private String datosVueloObservaciones;

    private Boolean otrosVerificacionCorrecto;
    private String otrosVerificacionObservaciones;

    // 2. Recogida y almacenaje
    private Boolean aeronaveCorrecto;
    private String aeronaveObservaciones;

    private Boolean unidadControlCorrecto;
    private String unidadControlObservaciones;

    private Boolean sensoresRecogidaCorrecto;
    private String sensoresRecogidaObservaciones;

    private Boolean antenasCorrecto;
    private String antenasObservaciones;

    private Boolean otrosRecogidaCorrecto;
    private String otrosRecogidaObservaciones;

    public static Anexo7ResponseDTO fromEntity(Anexo7 anexo) {
        Anexo7ResponseDTO dto = new Anexo7ResponseDTO();
        dto.setId(anexo.getId());
        dto.setNumeroVersion(anexo.getNumeroVersion());
        dto.setEstado(anexo.getEstado());
        dto.setNombreConops(anexo.getNombreConops());
        dto.setFechaOp(anexo.getFechaOp());
        dto.setAircraftId(anexo.getAircraftId());
        dto.setTiempoVueloMinutos(anexo.getTiempoVueloMinutos());
        dto.setCiclosAterrizaje(anexo.getCiclosAterrizaje());
        dto.setEstructuraCorrecto(anexo.getEstructuraCorrecto());
        dto.setEstructuraObservaciones(anexo.getEstructuraObservaciones());
        dto.setBateriasCorrecto(anexo.getBateriasCorrecto());
        dto.setBateriasObservaciones(anexo.getBateriasObservaciones());
        dto.setSensoresCorrecto(anexo.getSensoresCorrecto());
        dto.setSensoresObservaciones(anexo.getSensoresObservaciones());
        dto.setMotoresCorrecto(anexo.getMotoresCorrecto());
        dto.setMotoresObservaciones(anexo.getMotoresObservaciones());
        dto.setHelicesCorrecto(anexo.getHelicesCorrecto());
        dto.setHelicesObservaciones(anexo.getHelicesObservaciones());
        dto.setPartesMovilesCorrecto(anexo.getPartesMovilesCorrecto());
        dto.setPartesMovilesObservaciones(anexo.getPartesMovilesObservaciones());
        dto.setComunicacionesCorrecto(anexo.getComunicacionesCorrecto());
        dto.setComunicacionesObservaciones(anexo.getComunicacionesObservaciones());
        dto.setPlantaPotenciaCorrecto(anexo.getPlantaPotenciaCorrecto());
        dto.setPlantaPotenciaObservaciones(anexo.getPlantaPotenciaObservaciones());
        dto.setCargaPagoCorrecto(anexo.getCargaPagoCorrecto());
        dto.setCargaPagoObservaciones(anexo.getCargaPagoObservaciones());
        dto.setIdentificacionRemotaCorrecto(anexo.getIdentificacionRemotaCorrecto());
        dto.setIdentificacionRemotaObservaciones(anexo.getIdentificacionRemotaObservaciones());
        dto.setSistemaGeoconscienciaCorrecto(anexo.getSistemaGeoconscienciaCorrecto());
        dto.setSistemaGeoconscienciaObservaciones(anexo.getSistemaGeoconscienciaObservaciones());
        dto.setDatosVueloCorrecto(anexo.getDatosVueloCorrecto());
        dto.setDatosVueloObservaciones(anexo.getDatosVueloObservaciones());
        dto.setOtrosVerificacionCorrecto(anexo.getOtrosVerificacionCorrecto());
        dto.setOtrosVerificacionObservaciones(anexo.getOtrosVerificacionObservaciones());
        dto.setAeronaveCorrecto(anexo.getAeronaveCorrecto());
        dto.setAeronaveObservaciones(anexo.getAeronaveObservaciones());
        dto.setUnidadControlCorrecto(anexo.getUnidadControlCorrecto());
        dto.setUnidadControlObservaciones(anexo.getUnidadControlObservaciones());
        dto.setSensoresRecogidaCorrecto(anexo.getSensoresRecogidaCorrecto());
        dto.setSensoresRecogidaObservaciones(anexo.getSensoresRecogidaObservaciones());
        dto.setAntenasCorrecto(anexo.getAntenasCorrecto());
        dto.setAntenasObservaciones(anexo.getAntenasObservaciones());
        dto.setOtrosRecogidaCorrecto(anexo.getOtrosRecogidaCorrecto());
        dto.setOtrosRecogidaObservaciones(anexo.getOtrosRecogidaObservaciones());
        return dto;
    }
}
