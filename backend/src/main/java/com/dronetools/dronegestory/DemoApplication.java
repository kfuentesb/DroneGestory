package com.dronetools.dronegestory;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.util.List;

@Slf4j
@SpringBootApplication
public class DemoApplication {
    @Autowired
    private UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void runAfterStartup() {
        List allUsers = this.userRepository.findAll();
        log.info("Number of users: {}", allUsers.size());

        User newUser = new User();
        newUser.setFirstName("John");
        newUser.setLastName("Doe");
        log.info("Saving new user...");
        this.userRepository.save(newUser);

        allUsers = this.userRepository.findAll();
        log.info("Number of user: {}", allUsers.size());
    }
}
