package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(Integer id);
    User save(User user);
    void deleteById(Integer id);
}