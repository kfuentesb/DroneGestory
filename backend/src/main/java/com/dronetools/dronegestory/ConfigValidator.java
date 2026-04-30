package com.dronetools.dronegestory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(ConfigValidator.class);

    @Value("${spring.mail.username:NOT_FOUND}")
    private String mailUser;

    @Value("${spring.mail.password:NOT_FOUND}")
    private String mailPass;

    @Value("${spring.datasource.username:NOT_FOUND}")
    private String dbUser;

    @EventListener(ApplicationReadyEvent.class)
    public void verifyConfig() {
        logger.info("======= VALIDACIÓN DE CONFIGURACIÓN =======");
        
        checkVariable("EMAIL_USER", mailUser);
        checkVariable("EMAIL_PASSWORD", mailPass);
        checkVariable("DB_USER", dbUser);
        
        logger.info("===========================================");
    }

    private void checkVariable(String name, String value) {
        if ("NOT_FOUND".equals(value)) {
            logger.error("❌ {}: ¡NO ENCONTRADA!", name);
        } else {
            // Mostramos solo los primeros 3 caracteres por seguridad
            String masked = value.length() > 3 ? value.substring(0, 3) + "****" : "****";
            logger.info("✅ {}: CARGADA (Valor: {})", name, masked);
        }
    }
}