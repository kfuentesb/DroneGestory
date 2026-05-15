package com.dronetools.dronegestory.config;

import com.dronetools.dronegestory.util.UploadPathUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UploadsConfig {

    @Value("${APP_UPLOADS_ROOT:uploads}")
    private String uploadsRootPath;

    @PostConstruct
    public void init() {
        UploadPathUtils.setCustomUploadsRootPath(uploadsRootPath);
        System.out.println("[UploadsConfig] Ruta de almacenamiento configurada en: " + uploadsRootPath);
    }
}
