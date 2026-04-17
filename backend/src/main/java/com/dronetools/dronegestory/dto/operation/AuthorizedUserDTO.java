package com.dronetools.dronegestory.dto.operation;

import com.dronetools.dronegestory.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorizedUserDTO {
    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName;

    public static AuthorizedUserDTO fromEntity(User user) {
        AuthorizedUserDTO dto = new AuthorizedUserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName((user.getFirstName() + " " + user.getLastName()).trim());
        return dto;
    }
}
