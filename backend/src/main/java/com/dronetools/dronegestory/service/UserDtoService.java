package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.request.UserRequestDTO;
import com.dronetools.dronegestory.dto.response.UserResponseDTO;

import java.util.List;
import java.util.Optional;

public interface UserDtoService {
    List<UserResponseDTO> findAll();
    Optional<UserResponseDTO> findById(Integer id);
    UserResponseDTO create(UserRequestDTO dto);
    Optional<UserResponseDTO> update(Integer id, UserRequestDTO dto);
    void deleteById(Integer id);
}