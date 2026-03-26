package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class AnexoHistoricoDTO {
    private int numeroVersion;
    private AnexoStatus estado;
    private String color;
    private String firmadoPor;
    private LocalDate fechaFirma;
    private String textoPrueba;  // Contenido para preview

    public static AnexoHistoricoDTO fromEntity(Anexo anexo) {
        AnexoHistoricoDTO dto = new AnexoHistoricoDTO();
        dto.numeroVersion = anexo.getNumeroVersion();
        dto.estado = anexo.getEstado();
        dto.color = anexo.getEstado() == AnexoStatus.BORRADOR ? "AMARILLO" : "VERDE";
        dto.firmadoPor = anexo.getFirmadoPor();
        dto.fechaFirma = anexo.getFechaFirma();

        // Cast seguro al tipo específico para obtener textoPrueba
        if (anexo instanceof com.dronetools.dronegestory.model.anexos.Anexo4) {
            dto.textoPrueba = ((com.dronetools.dronegestory.model.anexos.Anexo4) anexo).getTextoPrueba();
        } else if (anexo instanceof com.dronetools.dronegestory.model.anexos.Anexo5) {
            dto.textoPrueba = ((com.dronetools.dronegestory.model.anexos.Anexo5) anexo).getTextoPrueba();
        } // ... etc para 6,7,8

        return dto;
    }

    public static List<AnexoHistoricoDTO> fromEntityList(List<Anexo> anexos) {
        return anexos.stream()
                .map(AnexoHistoricoDTO::fromEntity)
                .collect(Collectors.toList());
    }
}