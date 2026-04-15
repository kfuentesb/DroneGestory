package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.enums.AnexoStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
public class Anexo4ResponseDTO {
    private Long id;
    private int numeroVersion;
    private AnexoStatus estado;
    private String title;
    private String descripcion;
    private LocalDateTime fechaHoraPrevista;
    private String mediosMateriales;
    private String direccion;
    private String coords;

    // Si tienes personal como String, deja String. Si algún día es List<User>, cambia a List<UserLightDTO>
    private String personal;

    //private List<AircraftLightDTO> drones;

    private String imagenEspacioAereo;
    private String imagenZonaVuelo;

    private Boolean espacioAereoControlado;
    private Boolean estudioAeronauticoCoordinado;
    private Boolean entornoAerodromos;
    private Boolean distanciaMinimaInfraestructuras;
    private Boolean zonasProhibidasFlexible;
    private Boolean cumpleCondiciones;
    private Boolean zonasSeguridad;
    private Boolean permisoPrevioSeguridad;
    private Boolean serviciosEsencialesComunidad;
    private Boolean permisoPrevioServicios;
    private Boolean entornosUrbanos;
    private Boolean cumplenDistanciasEdificios;
    private Boolean comunicacionMinisterioInterior;
    private Boolean zonaResVueloFotografico;
    private Boolean permisoCecaf;
    private Boolean zonasProtMedioambiental;
    private Boolean disponeCoordGestor;
    private Boolean conopsYModeloSemantico;
    private Boolean aplicaModelo;
    private Boolean defineGeografiaVueloConops;
    private Boolean defineVolContigencia;
    private Boolean defineMargenRiesgoTierra;
    private Boolean defineZonaTerrestreControlada;
    private Boolean planificaUbicacionObservadores;
    private Boolean calculaAreaYEvaluaRiesgo;
    private Boolean notams;
    private Boolean revisaNotams;
    private Boolean tsaOCondicionada;
    private Boolean otrasLimitaciones;

    // Método estático de ayuda
    public static Anexo4ResponseDTO fromEntity(Anexo4 anexo) {
        Anexo4ResponseDTO dto = new Anexo4ResponseDTO();
        dto.setId(anexo.getId());
        dto.setNumeroVersion(anexo.getNumeroVersion());
        dto.setEstado(anexo.getEstado());
        dto.setTitle(anexo.getTitle());
        dto.setDescripcion(anexo.getDescripcion());
        dto.setFechaHoraPrevista(anexo.getFechaHoraPrevista());
        dto.setMediosMateriales(anexo.getMediosMateriales());
        dto.setDireccion(anexo.getDireccion());
        dto.setCoords(anexo.getCoords());

        dto.setPersonal(anexo.getPersonal());

//        if (anexo.getDrones() != null) {
//            dto.setDrones(anexo.getDrones().stream()
//                    .map(AircraftLightDTO::fromEntity)
//                    .collect(Collectors.toList()));
//        }

        dto.setImagenEspacioAereo(anexo.getImagenEspacioAereo());
        dto.setImagenZonaVuelo(anexo.getImagenZonaVuelo());

        dto.setEspacioAereoControlado(anexo.getEspacioAereoControlado());
        dto.setEstudioAeronauticoCoordinado(anexo.getEstudioAeronauticoCoordinado());
        dto.setEntornoAerodromos(anexo.getEntornoAerodromos());
        dto.setDistanciaMinimaInfraestructuras(anexo.getDistanciaMinimaInfraestructuras());
        dto.setZonasProhibidasFlexible(anexo.getZonasProhibidasFlexible());
        dto.setCumpleCondiciones(anexo.getCumpleCondiciones());
        dto.setZonasSeguridad(anexo.getZonasSeguridad());
        dto.setPermisoPrevioSeguridad(anexo.getPermisoPrevioSeguridad());
        dto.setServiciosEsencialesComunidad(anexo.getServiciosEsencialesComunidad());
        dto.setPermisoPrevioServicios(anexo.getPermisoPrevioServicios());
        dto.setEntornosUrbanos(anexo.getEntornosUrbanos());
        dto.setCumplenDistanciasEdificios(anexo.getCumplenDistanciasEdificios());
        dto.setComunicacionMinisterioInterior(anexo.getComunicacionMinisterioInterior());
        dto.setZonaResVueloFotografico(anexo.getZonaResVueloFotografico());
        dto.setPermisoCecaf(anexo.getPermisoCecaf());
        dto.setZonasProtMedioambiental(anexo.getZonasProtMedioambiental());
        dto.setDisponeCoordGestor(anexo.getDisponeCoordGestor());
        dto.setConopsYModeloSemantico(anexo.getConopsYModeloSemantico());
        dto.setAplicaModelo(anexo.getAplicaModelo());
        dto.setDefineGeografiaVueloConops(anexo.getDefineGeografiaVueloConops());
        dto.setDefineVolContigencia(anexo.getDefineVolContigencia());
        dto.setDefineMargenRiesgoTierra(anexo.getDefineMargenRiesgoTierra());
        dto.setDefineZonaTerrestreControlada(anexo.getDefineZonaTerrestreControlada());
        dto.setPlanificaUbicacionObservadores(anexo.getPlanificaUbicacionObservadores());
        dto.setCalculaAreaYEvaluaRiesgo(anexo.getCalculaAreaYEvaluaRiesgo());
        dto.setNotams(anexo.getNotams());
        dto.setRevisaNotams(anexo.getRevisaNotams());
        dto.setTsaOCondicionada(anexo.getTsaOCondicionada());
        dto.setOtrasLimitaciones(anexo.getOtrasLimitaciones());

        return dto;
    }
}