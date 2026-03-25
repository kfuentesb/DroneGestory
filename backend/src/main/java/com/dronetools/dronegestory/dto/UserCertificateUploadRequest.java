package com.dronetools.dronegestory.dto;

public record UserCertificateUploadRequest(
        String certificateType,
        String fileFieldKey,
        String expireDate,
        Boolean dateIndefinite
) {
}
