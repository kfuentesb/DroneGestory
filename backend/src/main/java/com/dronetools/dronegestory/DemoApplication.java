package com.dronetools.dronegestory;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Slf4j
@SpringBootApplication
@RequiredArgsConstructor
public class DemoApplication {

    private final UserRepository userRepository;
    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void runAfterStartup() {
        List<User> allUsers = userRepository.findAll();
        log.info("Number of users: {}", allUsers.size());

        Operator operator = operatorRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Operator op = new Operator();
                    op.setName("Default Operator");
                    op.setEmail("operator@example.com");
                    op.setFiscalId(12345678);
                    op.setOperatorNumber(1001);
                    op.setRidSecretCode(9999);
                    op.setAddress("Default address");
                    op.setPostalCode(10000);
                    op.setCity("Default City");
                    op.setProvince("Default Province");
                    op.setPhoneNumber(123456789);
                    return operatorRepository.save(op);
                });

        User newUser = new User();
        newUser.setOperator(operator);
        newUser.setFirstName("John");
        newUser.setLastName("Doe");
        newUser.setUsername("john.doe");
        newUser.setPassword(passwordEncoder.encode("password123"));
        newUser.setEmail("john.doe@example.com");
        newUser.setPhoneNumber(123456789);
        newUser.setImagePath(null);

        log.info("Saving new user...");
        userRepository.save(newUser);

        allUsers = userRepository.findAll();
        log.info("Number of users: {}", allUsers.size());
    }
}