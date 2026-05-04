package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.AutomaticMailPreferenceRequest;
import com.dronetools.dronegestory.dto.AutomaticMailPreferenceResponse;
import com.dronetools.dronegestory.model.AutomaticMailPreference;
import com.dronetools.dronegestory.model.User;
import com.dronetools.dronegestory.repository.AutomaticMailPreferenceRepository;
import com.dronetools.dronegestory.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutomaticMailPreferenceService {

    private final AutomaticMailPreferenceRepository automaticMailPreferenceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AutomaticMailPreferenceResponse> findAllForUsers() {
        Map<Integer, AutomaticMailPreference> preferencesByUserId = automaticMailPreferenceRepository.findAll()
                .stream()
                .collect(Collectors.toMap(preference -> preference.getUser().getId(), Function.identity()));

        return userRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(User::getUsername))
                .map(user -> toResponse(user.getId(), preferencesByUserId.get(user.getId())))
                .toList();
    }

    @Transactional
    public AutomaticMailPreferenceResponse update(Integer userId, AutomaticMailPreferenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        AutomaticMailPreference preference = automaticMailPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    AutomaticMailPreference created = new AutomaticMailPreference();
                    created.setUser(user);
                    return created;
                });

        preference.setCertificates(request.certificates());
        preference.setOperations(request.operations());
        preference.setMaintenance(request.maintenance());
        preference.setEvents(request.events());

        return toResponse(userId, automaticMailPreferenceRepository.save(preference));
    }

    private AutomaticMailPreferenceResponse toResponse(Integer userId, AutomaticMailPreference preference) {
        if (preference == null) {
            return new AutomaticMailPreferenceResponse(userId, false, false, false, false);
        }
        return new AutomaticMailPreferenceResponse(
                userId,
                preference.isCertificates(),
                preference.isOperations(),
                preference.isMaintenance(),
                preference.isEvents()
        );
    }
}
