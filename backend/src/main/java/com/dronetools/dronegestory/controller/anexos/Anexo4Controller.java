package com.dronetools.dronegestory.controller.anexos;

import com.dronetools.dronegestory.controller.AnexoControllerBase;
import com.dronetools.dronegestory.dto.operation.Anexo4RequestDTO;
import com.dronetools.dronegestory.dto.operation.Anexo4ResponseDTO;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.service.anexos.Anexo4Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operations/{operationId}/anexo4")
public class Anexo4Controller extends AnexoControllerBase<Anexo4, Anexo4Service> {
    private static final Logger LOGGER = LoggerFactory.getLogger(Anexo4Controller.class);

    //private final AircraftRepository aircraftRepository;

    public Anexo4Controller(Anexo4Service service,
                            OperationRepository operationRepository,
                            Anexo4Repository repository) {
        super(service, operationRepository, repository);
        //this.aircraftRepository = aircraftRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Anexo4ResponseDTO> createAnexo4WithImagen(
            @PathVariable Long operationId,
            @ModelAttribute Anexo4 anexo4,
            @RequestParam(value = "conops", required = false) String conops,
            @RequestParam(value = "imagenEspacioAereoFile", required = false) MultipartFile imagenEspacioAereoFile,
            @RequestParam(value = "imagenZonaVueloFile", required = false) MultipartFile imagenZonaVueloFile,
            HttpServletRequest request
    ) throws IOException {
        anexo4.setAircraftIds(resolveAircraftIds(anexo4, request));
        Anexo4 saved = service.createWithFile(operationId, anexo4, conops, imagenEspacioAereoFile, imagenZonaVueloFile);
        return ResponseEntity.ok(toResponse(saved, operationId));
    }

    @PutMapping("/{idAnexo}/firmar/datos")
    public Anexo4ResponseDTO firmarConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Sistema";
        Anexo4 anexo = service.firmarAnexo(idAnexo, username);
        return toResponse(anexo, operationId);
    }

    @PostMapping("/{idAnexo}/rehacer/datos")
    public Anexo4ResponseDTO rehacerConDatos(@PathVariable Long operationId, @PathVariable Long idAnexo) {
        Anexo4 anexoRehecho = service.rehacerAnexo4(idAnexo);
        return toResponse(anexoRehecho, operationId);
    }

    @GetMapping("/datos")
    public ResponseEntity<Anexo4ResponseDTO> getDatos(@PathVariable Long operationId) {
        Operation op = operationRepository.findByIdWithAnexos4(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));
        Anexo4 anexo4 = op.getAnexo4Actual();
        if (anexo4 == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(toResponse(anexo4, operationId));
    }

    @GetMapping("/{idAnexo}/datos")
    public ResponseEntity<Anexo4ResponseDTO> getDatosVersion(
            @PathVariable Long operationId,
            @PathVariable Long idAnexo
    ) {
        operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada"));

        Anexo4 anexo4 = repository.findById(idAnexo)
                .orElseThrow(() -> new RuntimeException("Anexo no encontrado"));

        if (anexo4.getOperation() == null || !anexo4.getOperation().getIdOperacion().equals(operationId)) {
            throw new RuntimeException("El anexo no pertenece a la operación indicada");
        }

        return ResponseEntity.ok(toResponse(anexo4, operationId));
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
        anexo.setAircraftIds(dto.getAircraftIds());

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

    private Anexo4ResponseDTO toResponse(Anexo4 anexo, Long operationId) {
        Anexo4ResponseDTO dto = Anexo4ResponseDTO.fromEntity(anexo);
        operationRepository.findById(operationId).ifPresent(operation -> dto.setConops(operation.getConops()));
        return dto;
    }

    private List<Long> resolveAircraftIds(Anexo4 anexo4, HttpServletRequest request) {
        LinkedHashSet<Long> aircraftIds = new LinkedHashSet<>();
        addAircraftIds(aircraftIds, anexo4.getAircraftIds());
        addAircraftIds(aircraftIds, request.getParameterValues("aircraftIds"));
        addAircraftIds(aircraftIds, request.getParameterValues("aircraftIds[]"));

        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            if (entry.getKey() != null && entry.getKey().startsWith("aircraftIds[")) {
                addAircraftIds(aircraftIds, entry.getValue());
            }
        }

        return new ArrayList<>(aircraftIds);
    }

    private void addAircraftIds(LinkedHashSet<Long> target, List<Long> values) {
        if (values == null) {
            return;
        }
        for (Long value : values) {
            if (value != null) {
                target.add(value);
            }
        }
    }

    private void addAircraftIds(LinkedHashSet<Long> target, String[] values) {
        if (values == null) {
            return;
        }
        for (String value : values) {
            if (value == null || value.isBlank()) {
                continue;
            }
            String[] splitValues = value.split(",");
            for (String raw : splitValues) {
                String trimmed = raw.trim();
                if (trimmed.isBlank()) {
                    continue;
                }
                try {
                    target.add(Long.parseLong(trimmed));
                } catch (NumberFormatException ignored) {
                    LOGGER.warn("Valor de aircraftId inválido recibido en Anexo 4: {}", trimmed);
                }
            }
        }
    }

}
