package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    public UserServiceImpl(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<User> findAll() { return repository.findAll(); }

    @Override
    public Optional<User> findById(Integer id) { return repository.findById(id); }

    @Override
    public User save(User user) { return repository.save(user); }

    @Override
    public void deleteById(Integer id) { repository.deleteById(id); }
}