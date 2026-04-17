package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo5;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class Anexo5ResponseDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String nombreConops;
    private LocalDateTime fechaOp;

    // Seccion 1.1.1
    private Boolean vlos;
    private Boolean ubicacionObservadores;
    private Boolean evaluacionVisibilidadYAlcance;
    // 1.1.2
    private Boolean condicionantesAcordadosConGestor;
    // 1.1.3
    private Boolean analisisEnFuncionConops;
    private Boolean evaluacionEntornoAereoAdyacente;
    private Boolean vueloTerrestreControlado;
    // 1.2.1
    private Boolean notamActivos;
    private Boolean tsaPreviaNotam;
    private Boolean procedimientosATSP;
    // 2.1
    private Boolean condicionesClimatologicas;
    // 3.1
    private Boolean personalSabeFunciones;
    // 4
    private Boolean comunicacionEntrePersonal;
    private Boolean comunicacion3Partes;
    // 5
    private Boolean requisitosSeguridad;
    private Boolean requisitosMedioAmbiente;
    private Boolean requisitosRadioelectrico;
    private Boolean requisitosLocalesEspecificos;
    // 6
    private Boolean atenuacionesGRC;
    private Boolean atenuacionesARC;
    // 7
    private Boolean comprobacionesUasVuelo;
    private List<AuthorizedUserDTO> personalSeleccionado;
    private List<Anexo5AptitudFirmaDTO> aptitudFirmas;
    private String creadorUsername;

    public static Anexo5ResponseDTO fromEntity(Anexo5 anexo) {
        Anexo5ResponseDTO dto = new Anexo5ResponseDTO();
        dto.setId(anexo.getId());
        dto.setNumeroVersion(anexo.getNumeroVersion());
        dto.setEstado(anexo.getEstado());
        dto.setNombreConops(anexo.getNombreConops());
        dto.setFechaOp(anexo.getFechaOp());
        dto.setVlos(anexo.getVlos());
        dto.setUbicacionObservadores(anexo.getUbicacionObservadores());
        dto.setEvaluacionVisibilidadYAlcance(anexo.getEvaluacionVisibilidadYAlcance());
        dto.setCondicionantesAcordadosConGestor(anexo.getCondicionantesAcordadosConGestor());
        dto.setAnalisisEnFuncionConops(anexo.getAnalisisEnFuncionConops());
        dto.setEvaluacionEntornoAereoAdyacente(anexo.getEvaluacionEntornoAereoAdyacente());
        dto.setVueloTerrestreControlado(anexo.getVueloTerrestreControlado());
        dto.setNotamActivos(anexo.getNotamActivos());
        dto.setTsaPreviaNotam(anexo.getTsaPreviaNotam());
        dto.setProcedimientosATSP(anexo.getProcedimientosATSP());
        dto.setCondicionesClimatologicas(anexo.getCondicionesClimatologicas());
        dto.setPersonalSabeFunciones(anexo.getPersonalSabeFunciones());
        dto.setComunicacionEntrePersonal(anexo.getComunicacionEntrePersonal());
        dto.setComunicacion3Partes(anexo.getComunicacion3Partes());
        dto.setRequisitosSeguridad(anexo.getRequisitosSeguridad());
        dto.setRequisitosMedioAmbiente(anexo.getRequisitosMedioAmbiente());
        dto.setRequisitosRadioelectrico(anexo.getRequisitosRadioelectrico());
        dto.setRequisitosLocalesEspecificos(anexo.getRequisitosLocalesEspecificos());
        dto.setAtenuacionesGRC(anexo.getAtenuacionesGRC());
        dto.setAtenuacionesARC(anexo.getAtenuacionesARC());
        dto.setComprobacionesUasVuelo(anexo.getComprobacionesUasVuelo());
        dto.setPersonalSeleccionado(
                anexo.getOperation() != null && anexo.getOperation().getAnexo4Actual() != null
                        ? anexo.getOperation().getAnexo4Actual().getPersonalSeleccionado().stream()
                        .map(AuthorizedUserDTO::fromEntity)
                        .toList()
                        : List.of()
        );
        dto.setAptitudFirmas(
                anexo.getAptitudFirmas().stream()
                        .map(Anexo5AptitudFirmaDTO::fromEntity)
                        .toList()
        );
        dto.setCreadorUsername(anexo.getOperation() != null ? anexo.getOperation().getCreador().getUsername() : null);
        return dto;
    }
}
