package com.dronetools.dronegestory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DroneGestoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(DroneGestoryApplication.class, args);
    }

}
