package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo8ResponseDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String nombreConops;
    private LocalDateTime fechaOp;

    // 1.1
    private Boolean condicionesATSP;
    // 1.2
    private Boolean comunicacion3FinalizacionOperacion;
    private Boolean comunicacionZrvfCecaf;
    // 2.1
    private Boolean anotacionTiempoVueloAeronave;
    private Boolean anotacionTIempoActividadPersonal;
    // 2.2
    private Boolean anotacionEventosOcurridosOperacion;
    private Boolean comunicacionIncidentes;

    public static Anexo8ResponseDTO fromEntity(Anexo8 anexo) {
        Anexo8ResponseDTO dto = new Anexo8ResponseDTO();
        dto.setId(anexo.getId());
        dto.setNumeroVersion(anexo.getNumeroVersion());
        dto.setEstado(anexo.getEstado());
        dto.setNombreConops(anexo.getNombreConops());
        dto.setFechaOp(anexo.getFechaOp());
        dto.setCondicionesATSP(anexo.getCondicionesATSP());
        dto.setComunicacion3FinalizacionOperacion(anexo.getComunicacion3FinalizacionOperacion());
        dto.setComunicacionZrvfCecaf(anexo.getComunicacionZrvfCecaf());
        dto.setAnotacionTiempoVueloAeronave(anexo.getAnotacionTiempoVueloAeronave());
        dto.setAnotacionTIempoActividadPersonal(anexo.getAnotacionTIempoActividadPersonal());
        dto.setAnotacionEventosOcurridosOperacion(anexo.getAnotacionEventosOcurridosOperacion());
        dto.setComunicacionIncidentes(anexo.getComunicacionIncidentes());
        return dto;
    }
}
