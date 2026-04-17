package com.dronetools.dronegestory.dto.operation;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class Anexo5AptitudSectionDTO {
    private boolean puedeFirmar;
    private boolean yaFirmado;
    private List<Anexo5AptitudFirmaDTO> firmas;
}
