package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.anexos.Anexo6;
import com.dronetools.dronegestory.model.anexos.Anexo7;
import com.dronetools.dronegestory.model.anexos.Anexo8;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AnexoHistoricoDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String color;
    private String firmadoPor;
    private LocalDateTime fechaFirma;
    private String textoPrueba;

    public static AnexoHistoricoDTO fromEntity(Anexo anexo) {
        AnexoHistoricoDTO dto = new AnexoHistoricoDTO();
        dto.id = anexo.getId();
        dto.numeroVersion = anexo.getNumeroVersion();
        dto.estado = anexo.getEstado();
        dto.color = anexo.getEstado() == AnexoStatus.BORRADOR ? "AMARILLO" : "VERDE";
        dto.firmadoPor = anexo.getFirmadoPor();
        dto.fechaFirma = anexo.getFechaFirma();
        dto.textoPrueba = extractTextoPrueba(anexo);
        return dto;
    }

    public static List<AnexoHistoricoDTO> fromEntityList(List<Anexo> anexos) {
        return anexos.stream()
                .map(AnexoHistoricoDTO::fromEntity)
                .toList();
    }

    private static String extractTextoPrueba(Anexo anexo) {
        if (anexo instanceof Anexo4 anexo4) {
            return anexo4.getDescripcion();
        }
        if (anexo instanceof Anexo5 anexo5) {
            return anexo5.getTextoPrueba();
        }
        if (anexo instanceof Anexo6 anexo6) {
            return anexo6.getTextoPrueba();
        }
        if (anexo instanceof Anexo7 anexo7) {
            return anexo7.getTextoPrueba();
        }
        if (anexo instanceof Anexo8 anexo8) {
            return anexo8.getTextoPrueba();
        }
        return null;
    }
}
