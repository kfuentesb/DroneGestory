package com.dronetools.dronegestory.dto;

import java.util.List;

public record AuthResponse(boolean ok, String username, String token, List<String> roles) {
}
