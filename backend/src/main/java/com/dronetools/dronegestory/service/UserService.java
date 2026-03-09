package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    // Obtener todos los usuarios
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Obtener un usuario por id
    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    // Crear un nuevo usuario
    public User create(User user) {
        return userRepository.save(user);
    }

    // Actualizar un usuario existente
    public Optional<User> update(Integer id, User updatedUser) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setFirstName(updatedUser.getFirstName());
                    existingUser.setLastName(updatedUser.getLastName());
                    existingUser.setUsername(updatedUser.getUsername());
                    existingUser.setPassword(updatedUser.getPassword());
                    existingUser.setEmail(updatedUser.getEmail());
                    existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
                    existingUser.setImagePath(updatedUser.getImagePath());
                    return userRepository.save(existingUser);
                });
    }

    // Eliminar un usuario por id
    public void deleteById(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public Optional<User> login(String username, String password) {
    Optional<User> userOpt = userRepository.findByUsername(username);

    if (userOpt.isPresent()) {
        User user = userOpt.get();

        if (user.getPassword().equals(password)) { // simple test login
            return Optional.of(user);
        }
    }

    return Optional.empty();
}
}