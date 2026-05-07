package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.OperationRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.repository.anexos.Anexo4Repository;
import com.dronetools.dronegestory.service.AnexoServiceBase;
import com.dronetools.dronegestory.util.UploadPathUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class Anexo4Service extends AnexoServiceBase<Anexo4> {

    private static final Set<String> OPCIONES_LIMITACIONES = Set.of("SI", "NO", "N/A");
    private static final Set<String> VALORES_HABILITADORES_LIMITACIONES = Set.of("SI");
    private final UserRepository userRepository;
    private final Anexo5Service anexo5Service;

    public Anexo4Service(
            Anexo4Repository repository,
            OperationRepository operationRepository,
            UserRepository userRepository,
            Anexo5Service anexo5Service
    ) {
        super(repository, operationRepository);
        this.userRepository = userRepository;
        this.anexo5Service = anexo5Service;
    }

    @Transactional
    public Anexo4 registrarAnexo4(Long operationId, Anexo4 datosNuevos) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
        if (datosNuevos.getOperation() != null) {
            operation.setConops(datosNuevos.getOperation().getConops());
        }
        applySelectedPersonnel(operation, datosNuevos.getSelectedPersonnelIds());
        operationRepository.save(operation);
        anexo5Service.syncCurrentAnexo5SignaturesWithAssignedUsers(operationId);
        return registrarAnexo(operationId, datosNuevos,
                Operation::getAnexo4Actual,
                Operation::getNextVersionAnexo4);
    }

    @Transactional
    public Anexo4 rehacerAnexo4(Long idAnexoOrigen) {
        return rehacerAnexo(idAnexoOrigen, Operation::getNextVersionAnexo4);
    }

    @Override
    protected void actualizarCampos(Anexo4 destino, Anexo4 origen) {
        // Campos simples
        destino.setDescripcion(origen.getDescripcion());
        destino.setFechaHoraPrevista(origen.getFechaHoraPrevista());
        destino.setMediosMateriales(origen.getMediosMateriales());
        destino.setDireccion(origen.getDireccion());
        destino.setCoords(origen.getCoords());

        // Imágenes
        destino.setImagenEspacioAereo(origen.getImagenEspacioAereo());
        destino.setImagenZonaVuelo(origen.getImagenZonaVuelo());

        // Personal y Drones
        destino.setPersonal(origen.getPersonal());
        destino.setAircraftIds(copyAircraftIds(origen.getAircraftIds()));

//        destino.getDrones().clear();
//        if (origen.getDrones() != null) {
//            destino.getDrones().addAll(origen.getDrones());
//        }

        // Booleands sección 4
        destino.setEspacioAereoControlado(origen.getEspacioAereoControlado());
        destino.setEstudioAeronauticoCoordinado(origen.getEstudioAeronauticoCoordinado());
        destino.setEntornoAerodromos(origen.getEntornoAerodromos());
        destino.setDistanciaMinimaInfraestructuras(origen.getDistanciaMinimaInfraestructuras());
        destino.setZonasProhibidasFlexible(origen.getZonasProhibidasFlexible());
        destino.setCumpleCondiciones(origen.getCumpleCondiciones());
        destino.setZonasSeguridad(origen.getZonasSeguridad());
        destino.setPermisoPrevioSeguridad(origen.getPermisoPrevioSeguridad());
        destino.setServiciosEsencialesComunidad(origen.getServiciosEsencialesComunidad());
        destino.setPermisoPrevioServicios(origen.getPermisoPrevioServicios());
        destino.setEntornosUrbanos(origen.getEntornosUrbanos());
        destino.setCumplenDistanciasEdificios(origen.getCumplenDistanciasEdificios());
        destino.setComunicacionMinisterioInterior(origen.getComunicacionMinisterioInterior());
        destino.setZonaResVueloFotografico(origen.getZonaResVueloFotografico());
        destino.setPermisoCecaf(origen.getPermisoCecaf());
        destino.setZonasProtMedioambiental(origen.getZonasProtMedioambiental());
        destino.setDisponeCoordGestor(origen.getDisponeCoordGestor());

        // Booleands sección 6
        destino.setConopsYModeloSemantico(origen.getConopsYModeloSemantico());
        destino.setAplicaModelo(origen.getAplicaModelo());
        destino.setDefineGeografiaVueloConops(origen.getDefineGeografiaVueloConops());
        destino.setDefineVolContigencia(origen.getDefineVolContigencia());
        destino.setDefineMargenRiesgoTierra(origen.getDefineMargenRiesgoTierra());
        destino.setDefineZonaTerrestreControlada(origen.getDefineZonaTerrestreControlada());
        destino.setPlanificaUbicacionObservadores(origen.getPlanificaUbicacionObservadores());
        destino.setCalculaAreaYEvaluaRiesgo(origen.getCalculaAreaYEvaluaRiesgo());
        destino.setNotams(origen.getNotams());
        destino.setRevisaNotams(origen.getRevisaNotams());
        destino.setTsaOCondicionada(origen.getTsaOCondicionada());
        destino.setOtrasLimitacionesInicial(origen.getOtrasLimitacionesInicial());

        String otrasLimitacionesValor = TablaExpandibleUtils.normalizeMainValue(
            origen.getOtrasLimitacionesValor(),
            OPCIONES_LIMITACIONES,
            "N/A"
        );
        destino.setOtrasLimitacionesValor(otrasLimitacionesValor);
        destino.setOtrasLimitacionesItems(
            TablaExpandibleUtils.normalizeItems(
                otrasLimitacionesValor,
                VALORES_HABILITADORES_LIMITACIONES,
                origen.getOtrasLimitacionesItems(),
                OPCIONES_LIMITACIONES,
                "N/A"
            )
        );
    }

    /**
     * Crea una copia exacta del anexo firmado para la nueva versión.
     * Se usa cuando el usuario pulsa "Rehacer" en un anexo firmado.
     */
    @Override
    protected Anexo4 crearCopia(Anexo4 origen) {
        Anexo4 copia = new Anexo4();

        // Campos simples
        copia.setDescripcion(origen.getDescripcion());
        copia.setFechaHoraPrevista(origen.getFechaHoraPrevista());
        copia.setMediosMateriales(origen.getMediosMateriales());
        copia.setDireccion(origen.getDireccion());
        copia.setCoords(origen.getCoords());

        // Imágenes
        copia.setImagenEspacioAereo(origen.getImagenEspacioAereo());
        copia.setImagenZonaVuelo(origen.getImagenZonaVuelo());

        // Relaciones (copiar referencias, no clonar entidades)
        copia.setPersonal(origen.getPersonal());
        copia.setAircraftIds(copyAircraftIds(origen.getAircraftIds()));

//        if (origen.getDrones() != null) {
//            copia.getDrones().addAll(origen.getDrones());
//        }

        // Booleands sección 4
        copia.setEspacioAereoControlado(origen.getEspacioAereoControlado());
        copia.setEstudioAeronauticoCoordinado(origen.getEstudioAeronauticoCoordinado());
        copia.setEntornoAerodromos(origen.getEntornoAerodromos());
        copia.setDistanciaMinimaInfraestructuras(origen.getDistanciaMinimaInfraestructuras());
        copia.setZonasProhibidasFlexible(origen.getZonasProhibidasFlexible());
        copia.setCumpleCondiciones(origen.getCumpleCondiciones());
        copia.setZonasSeguridad(origen.getZonasSeguridad());
        copia.setPermisoPrevioSeguridad(origen.getPermisoPrevioSeguridad());
        copia.setServiciosEsencialesComunidad(origen.getServiciosEsencialesComunidad());
        copia.setPermisoPrevioServicios(origen.getPermisoPrevioServicios());
        copia.setEntornosUrbanos(origen.getEntornosUrbanos());
        copia.setCumplenDistanciasEdificios(origen.getCumplenDistanciasEdificios());
        copia.setComunicacionMinisterioInterior(origen.getComunicacionMinisterioInterior());
        copia.setZonaResVueloFotografico(origen.getZonaResVueloFotografico());
        copia.setPermisoCecaf(origen.getPermisoCecaf());
        copia.setZonasProtMedioambiental(origen.getZonasProtMedioambiental());
        copia.setDisponeCoordGestor(origen.getDisponeCoordGestor());

        // Booleands sección 6
        copia.setConopsYModeloSemantico(origen.getConopsYModeloSemantico());
        copia.setAplicaModelo(origen.getAplicaModelo());
        copia.setDefineGeografiaVueloConops(origen.getDefineGeografiaVueloConops());
        copia.setDefineVolContigencia(origen.getDefineVolContigencia());
        copia.setDefineMargenRiesgoTierra(origen.getDefineMargenRiesgoTierra());
        copia.setDefineZonaTerrestreControlada(origen.getDefineZonaTerrestreControlada());
        copia.setPlanificaUbicacionObservadores(origen.getPlanificaUbicacionObservadores());
        copia.setCalculaAreaYEvaluaRiesgo(origen.getCalculaAreaYEvaluaRiesgo());
        copia.setNotams(origen.getNotams());
        copia.setRevisaNotams(origen.getRevisaNotams());
        copia.setTsaOCondicionada(origen.getTsaOCondicionada());
        copia.setOtrasLimitacionesInicial(origen.getOtrasLimitacionesInicial());

        String otrasLimitacionesValor = TablaExpandibleUtils.normalizeMainValue(
            origen.getOtrasLimitacionesValor(),
            OPCIONES_LIMITACIONES,
            "N/A"
        );
        copia.setOtrasLimitacionesValor(otrasLimitacionesValor);
        copia.setOtrasLimitacionesItems(
            TablaExpandibleUtils.normalizeItems(
                otrasLimitacionesValor,
                VALORES_HABILITADORES_LIMITACIONES,
                origen.getOtrasLimitacionesItems(),
                OPCIONES_LIMITACIONES,
                "N/A"
            )
        );

        return copia;
    }

    @Transactional
    public Anexo4 createWithFile(
            Long operationId,
            Anexo4 anexo4,
            String conops,
            MultipartFile imagenEspacioAereoFile,
            MultipartFile imagenZonaVueloFile
    ) throws IOException {
        Operation operationForPath = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operacion no encontrada " + operationId));
        if (conops != null) {
            Operation operation = operationRepository.findById(operationId)
                    .orElseThrow(() -> new RuntimeException("Operación no encontrada " + operationId));
            operation.setConops(conops);
            operationRepository.save(operation);
        }

        // Validate and reject disallowed file types
        validateImageFile(imagenEspacioAereoFile);
        validateImageFile(imagenZonaVueloFile);

        // Prepare upload directory
        Path anexoDir = Paths.get("uploads", "operations", UploadPathUtils.operationFolder(operationForPath.getCodigo()), "anexo4").toAbsolutePath().normalize();
        Files.createDirectories(anexoDir);

        // Imagen espacio aéreo
        if (imagenEspacioAereoFile != null && !imagenEspacioAereoFile.isEmpty()) {
            String originalName = imagenEspacioAereoFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "espacioAereo"
                    : Paths.get(originalName).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + safeName;
            Path target = anexoDir.resolve(filename).normalize();
            if (!target.startsWith(anexoDir)) {
                throw new IllegalArgumentException("Nombre de archivo no válido");
            }
            imagenEspacioAereoFile.transferTo(target.toFile());
            anexo4.setImagenEspacioAereo(Paths.get("operations", UploadPathUtils.operationFolder(operationForPath.getCodigo()), "anexo4", filename)
                    .toString().replace("\\", "/"));
        }

        // Imagen zona vuelo
        if (imagenZonaVueloFile != null && !imagenZonaVueloFile.isEmpty()) {
            String originalName = imagenZonaVueloFile.getOriginalFilename();
            String safeName = (originalName == null || originalName.isBlank())
                    ? "zonaVuelo"
                    : Paths.get(originalName).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + safeName;
            Path target = anexoDir.resolve(filename).normalize();
            if (!target.startsWith(anexoDir)) {
                throw new IllegalArgumentException("Nombre de archivo no válido");
            }
            imagenZonaVueloFile.transferTo(target.toFile());
            anexo4.setImagenZonaVuelo(Paths.get("operations", UploadPathUtils.operationFolder(operationForPath.getCodigo()), "anexo4", filename)
                    .toString().replace("\\", "/"));
        }

        // Use proper versioned registration (handles BORRADOR/FIRMADO states and version numbers)
        return registrarAnexo4(operationId, anexo4);
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg") &&
                 !contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Solo se permiten imágenes JPG o PNG");
        }
        long maxSize = 5L * 1024 * 1024; // 5 MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("La imagen no puede superar los 5 MB");
        }
    }

    private List<Long> copyAircraftIds(List<Long> aircraftIds) {
        return aircraftIds == null ? new ArrayList<>() : new ArrayList<>(aircraftIds);
    }

    private void applySelectedPersonnel(Operation operation, List<Long> selectedPersonnelIds) {
        List<Long> normalizedIds = selectedPersonnelIds == null
                ? List.of()
                : selectedPersonnelIds.stream().filter(id -> id != null).distinct().toList();

        List<User> selectedUsers = normalizedIds.isEmpty()
                ? List.of()
                : userRepository.findAllById(normalizedIds.stream().map(Long::intValue).toList());

        operation.getAssignedUsers().clear();
        operation.getAssignedUsers().addAll(selectedUsers);
    }

}
