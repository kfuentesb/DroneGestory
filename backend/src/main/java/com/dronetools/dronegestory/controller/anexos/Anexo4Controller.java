package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo4RequestDTO;
import com.dronetools.dronegestory.dto.operation.Anexo4ResponseDTO;
import com.dronetools.dronegestory.dto.operation.AnexoInfoDTO;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.service.anexos.Anexo4Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo4")
public class Anexo4Controller extends AnexoControllerBase<Anexo4, Anexo4Service> {

    //private final AircraftRepository aircraftRepository;

    public Anexo4Controller(Anexo4Service service,
                            OperationRepository operationRepository,
                            Anexo4Repository repository) {
        super(service, operationRepository, repository);
        //this.aircraftRepository = aircraftRepository;
    }

    @GetMapping("/actual/detalle")
    public Anexo4ResponseDTO getActualDetalle(@PathVariable Long operationId) {
        Operation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo4 anexo = op.getAnexo4Actual();
        if (anexo == null) {
            return null;
        }
        return Anexo4ResponseDTO.fromEntity(anexo);
    }

    @PostMapping
    public AnexoInfoDTO saveOrUpdate(@PathVariable Long operationId, @ModelAttribute Anexo4RequestDTO dto) {
        Anexo4 anexo = convertDtoToEntity(dto);
        Anexo4 saved = service.registrarAnexo4(operationId, anexo);
        return AnexoInfoDTO.from(saved);
    }

    @Override
    protected Anexo4 registrar(Long operationId, Anexo4 input) {
        return service.registrarAnexo4(operationId, input);
    }

    @Override
    protected Anexo4 rehacerDesde(Long idAnexo) {
        return service.rehacerAnexo4(idAnexo);
    }

    @Override
    protected Anexo4 getAnexoActual(Operation op) {
        return op.getAnexo4Actual();
    }

    protected Anexo4 convertDtoToEntity(Anexo4RequestDTO dto) {
        Anexo4 anexo = new Anexo4();

        // Campos simples
        anexo.setDescripcion(dto.getDescripcion());
        anexo.setFechaHoraPrevista(dto.getFechaHoraPrevista());
        anexo.setMediosMateriales(dto.getMediosMateriales());
        anexo.setDireccion(dto.getDireccion());
        anexo.setCoords(dto.getCoords());

        // Personal como String
        anexo.setPersonal(dto.getPersonal());

        // Imágenes
        anexo.setImagenEspacioAereo(dto.getImagenEspacioAereo());
        anexo.setImagenZonaVuelo(dto.getImagenZonaVuelo());

        // Drones - buscar entidades por ID
//        if (dto.getDronesIds() != null && !dto.getDronesIds().isEmpty()) {
//            List<Aircraft> drones = aircraftRepository.findAllById(dto.getDronesIds());
//            anexo.setDrones(drones);
//        }

        // Booleands sección 4
        anexo.setEspacioAereoControlado(dto.getEspacioAereoControlado());
        anexo.setEstudioAeronauticoCoordinado(dto.getEstudioAeronauticoCoordinado());
        anexo.setEntornoAerodromos(dto.getEntornoAerodromos());
        anexo.setDistanciaMinimaInfraestructuras(dto.getDistanciaMinimaInfraestructuras());
        anexo.setZonasProhibidasFlexible(dto.getZonasProhibidasFlexible());
        anexo.setCumpleCondiciones(dto.getCumpleCondiciones());
        anexo.setZonasSeguridad(dto.getZonasSeguridad());
        anexo.setPermisoPrevioSeguridad(dto.getPermisoPrevioSeguridad());
        anexo.setServiciosEsencialesComunidad(dto.getServiciosEsencialesComunidad());
        anexo.setPermisoPrevioServicios(dto.getPermisoPrevioServicios());
        anexo.setEntornosUrbanos(dto.getEntornosUrbanos());
        anexo.setCumplenDistanciasEdificios(dto.getCumplenDistanciasEdificios());
        anexo.setComunicacionMinisterioInterior(dto.getComunicacionMinisterioInterior());
        anexo.setZonaResVueloFotografico(dto.getZonaResVueloFotografico());
        anexo.setPermisoCecaf(dto.getPermisoCecaf());
        anexo.setZonasProtMedioambiental(dto.getZonasProtMedioambiental());
        anexo.setDisponeCoordGestor(dto.getDisponeCoordGestor());

        // Booleands sección 6
        anexo.setConopsYModeloSemantico(dto.getConopsYModeloSemantico());
        anexo.setAplicaModelo(dto.getAplicaModelo());
        anexo.setDefineGeografiaVueloConops(dto.getDefineGeografiaVueloConops());
        anexo.setDefineVolContigencia(dto.getDefineVolContigencia());
        anexo.setDefineMargenRiesgoTierra(dto.getDefineMargenRiesgoTierra());
        anexo.setDefineZonaTerrestreControlada(dto.getDefineZonaTerrestreControlada());
        anexo.setPlanificaUbicacionObservadores(dto.getPlanificaUbicacionObservadores());
        anexo.setCalculaAreaYEvaluaRiesgo(dto.getCalculaAreaYEvaluaRiesgo());
        anexo.setNotams(dto.getNotams());
        anexo.setRevisaNotams(dto.getRevisaNotams());
        anexo.setTsaOCondicionada(dto.getTsaOCondicionada());
        anexo.setOtrasLimitaciones(dto.getOtrasLimitaciones());

        return anexo;
    }
}
