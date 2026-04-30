package com.dronetools.dronegestory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

@Component
public class ConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(ConfigValidator.class);

    private final Environment environment;
    private final JavaMailSenderImpl mailSender;

    public ConfigValidator(Environment environment, JavaMailSenderImpl mailSender) {
        this.environment = environment;
        this.mailSender = mailSender;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verifyConfig() {
        logger.info("======= VALIDACION DE CONFIGURACION =======");

        checkVariable("env EMAIL_USER", environment.getProperty("EMAIL_USER"));
        checkVariable("env EMAIL_PASSWORD", environment.getProperty("EMAIL_PASSWORD"));
        checkVariable("spring.mail.username", environment.getProperty("spring.mail.username"));
        checkVariable("spring.mail.password", environment.getProperty("spring.mail.password"));
        checkVariable("spring.datasource.username", environment.getProperty("spring.datasource.username"));

        logger.info("mail host: {}", mailSender.getHost());
        logger.info("mail port: {}", mailSender.getPort());
        checkVariable("mail sender username", mailSender.getUsername());
        checkVariable("mail sender password", mailSender.getPassword());

        logger.info("===========================================");
    }

    private void checkVariable(String name, String value) {
        if (value == null || value.isBlank()) {
            logger.error("{}: NO ENCONTRADA", name);
        } else {
            String masked = value.length() > 3 ? value.substring(0, 3) + "****" : "****";
            logger.info("{}: CARGADA ({})", name, masked);
        }
    }
}
