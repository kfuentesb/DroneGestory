package com.dronetools.dronegestory.service.impl;

import com.dronetools.dronegestory.dto.request.UserRequestDTO;
import com.dronetools.dronegestory.dto.response.UserResponseDTO;
import com.dronetools.dronegestory.mapper.UserMapper;
import com.dronetools.dronegestory.model.Operator;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.OperatorRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import com.dronetools.dronegestory.service.UserDtoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDtoServiceImpl implements UserDtoService {

    private final UserRepository userRepository;
    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;

    @Override
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public Optional<UserResponseDTO> findById(Integer id) {
        return userRepository.findById(id).map(mapper::toDto);
    }

    @Override
    public UserResponseDTO create(UserRequestDTO dto) {
        Operator operator = operatorRepository.findById(dto.getOperatorId())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        User user = mapper.toEntity(dto, operator, passwordEncoder.encode(dto.getPassword()));
        return mapper.toDto(userRepository.save(user));
    }

    @Override
    public Optional<UserResponseDTO> update(Integer id, UserRequestDTO dto) {
        return userRepository.findById(id).map(existing -> {
            Operator operator = operatorRepository.findById(dto.getOperatorId())
                    .orElseThrow(() -> new RuntimeException("Operator not found"));

            User user = mapper.toEntity(dto, operator, passwordEncoder.encode(dto.getPassword()));
            user.setId(existing.getId());
            return mapper.toDto(userRepository.save(user));
        });
    }

    @Override
    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}