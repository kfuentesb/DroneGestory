package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo5AptitudFirma;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Anexo5AptitudFirmaDTO {
    private Integer userId;
    private String username;
    private String fullName;
    private LocalDateTime fechaFirma;

    public static Anexo5AptitudFirmaDTO fromEntity(Anexo5AptitudFirma firma) {
        Anexo5AptitudFirmaDTO dto = new Anexo5AptitudFirmaDTO();
        dto.setUserId(firma.getUser().getId());
        dto.setUsername(firma.getUser().getUsername());
        dto.setFullName((firma.getUser().getFirstName() + " " + firma.getUser().getLastName()).trim());
        dto.setFechaFirma(firma.getFechaFirma());
        return dto;
    }
}
