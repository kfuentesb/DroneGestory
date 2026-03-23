package com.dronetools.dronegestory.common;

import com.dronetools.dronegestory.model.enums.AnexoStatus;

public interface AnexoVersionado {

    int getNumeroVersion();
    void setNumeroVersion(int numeroVersion);

    AnexoStatus getEstado();
    void setEstado(AnexoStatus estado);
}
