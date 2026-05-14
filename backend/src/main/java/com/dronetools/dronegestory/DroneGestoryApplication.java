package com.dronetools.dronegestory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DroneGestoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(DroneGestoryApplication.class, args);
    }

    @Autowired
    private org.springframework.core.env.Environment env;

    @jakarta.annotation.PostConstruct
    public void debugVariables() {
        System.out.println("======= DEBUG SPRING ENVIRONMENT =======");
        System.out.println("USER: " + env.getProperty("EMAIL_USER"));
        System.out.println("PASS: " + (env.getProperty("EMAIL_PASSWORD") != null ? "PRESENTE" : "NULL"));
        System.out.println("JWT SECRET: " + (env.getProperty("JWT_SECRET") != null ? "CARGADO CORRECTAMENTE" : "USANDO VALOR POR DEFECTO"));
        System.out.println("========================================");
    }

}
