package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.AuthResponse;
import com.dronetools.dronegestory.dto.LoginRequest;
import com.dronetools.dronegestory.security.JwtService;
import com.dronetools.dronegestory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.dronetools.dronegestory.model.User;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            String usernameOrEmail = body.username();
            String password = body.password();

            // Find user by username or email
            var userOpt = userService.findByUsernameOrEmail(usernameOrEmail);
            if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "ok", false,
                "message", "Invalid credentials"
            ));
            }
            User userEntity = userOpt.get();
            if (!userEntity.isState()) {
            return ResponseEntity.status(401).body(Map.of(
                "ok", false,
                "message", "Your account is inactive. Please contact support."
            ));
            }

            // Authenticate using username (not email)
            UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(userEntity.getUsername(), password);

            Authentication authentication = authenticationManager.authenticate(authRequest);
            Integer userId = userEntity.getId();
            String token = jwtService.generateToken(
                (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()
            );
            List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

            return ResponseEntity.ok(new AuthResponse(true, userId, userEntity.getUsername(), token, roles));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "ok", false,
                "message", "Invalid credentials"
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("ok", true, "message", "Logout client-side"));
    }
}
