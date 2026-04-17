package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.common.AnexoVersionado;
import com.dronetools.dronegestory.model.Anexo;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.enums.OperationStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OperationDetailDTO {
    private Long idOperacion;
    private String codigo;
    private String nombreCreador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private OperationStatus estadoOperacion;
    private boolean completada;
    private boolean todosAnexosFirmados;
    private List<OperationAnexoDetailDTO> anexos;
    private String conops;

    public OperationDetailDTO(Operation op) {
        this.idOperacion = op.getIdOperacion();
        this.codigo = op.getCodigo();
        this.nombreCreador = op.getCreador().getFirstName() + " " + op.getCreador().getLastName();
        this.fechaCreacion = op.getFechaCreacion();
        this.fechaActualizacion = op.getFechaActualizacion();
        this.estadoOperacion = op.getEstado();
        this.completada = op.getEstado() == OperationStatus.COMPLETADA;
        this.todosAnexosFirmados = op.todosAnexosFirmados();
        this.anexos = List.of(
                buildAnexoDetail(4, op.getAnexo4Actual(), op.getAnexos4()),
                buildAnexoDetail(5, op.getAnexo5Actual(), op.getAnexos5()),
                buildAnexoDetail(6, op.getAnexo6Actual(), op.getAnexos6()),
                buildAnexoDetail(7, op.getAnexo7Actual(), op.getAnexos7()),
                buildAnexoDetail(8, op.getAnexo8Actual(), op.getAnexos8())
        );
        this.conops = op.getConops();
    }

    private OperationAnexoDetailDTO buildAnexoDetail(int tipoAnexo, AnexoVersionado actual, List<? extends Anexo> versiones) {
        return new OperationAnexoDetailDTO(
                tipoAnexo,
                mapAnexo(actual),
                mapHistorico(versiones)
        );
    }

    private AnexoInfoDTO mapAnexo(AnexoVersionado anexo) {
        if (anexo == null) {
            return AnexoInfoDTO.empty();
        }
        Anexo anexoEntity = (Anexo) anexo;
        return new AnexoInfoDTO(anexoEntity.getId(), anexo.getNumeroVersion(), anexo.getEstado());
    }

    private List<AnexoHistoricoDTO> mapHistorico(List<? extends Anexo> anexos) {
        return anexos.stream()
                .map(AnexoHistoricoDTO::fromEntity)
                .toList();
    }
}
