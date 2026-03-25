package com.dronetools.dronegestory.dto;

import java.time.LocalDate;

public record UserCertificateDTO(
        Integer id,
        Integer userId,
        String certificateType,
        String certificateName,
        LocalDate expireDate,
        Boolean dateIndefinite
) {
}
