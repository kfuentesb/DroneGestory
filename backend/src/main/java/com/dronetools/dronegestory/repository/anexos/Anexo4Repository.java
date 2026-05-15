package com.dronetools.dronegestory.repository.anexos;

import com.dronetools.dronegestory.model.anexos.Anexo4;
import com.dronetools.dronegestory.repository.AnexoBaseRepository;

import java.util.List;


public interface Anexo4Repository extends AnexoBaseRepository<Anexo4, Long> {
    List<Anexo4> findByImagenEspacioAereo(String imagenEspacioAereo);
    List<Anexo4> findByImagenZonaVuelo(String imagenZonaVuelo);
}
