package com.dronetools.dronegestory.dto;

import com.dronetools.dronegestory.model.enums.UserType;

import java.util.List;

public record UserNameResponse(Integer id, String firstName, String lastName, List<UserType> roles) {}
