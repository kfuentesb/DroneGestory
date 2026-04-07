package com.dronetools.dronegestory.dto;

public record UserCertificateUploadRequest(
        String certificateType,
        String certificateLabel,
        String fileFieldKey,
        String expireDate,
        Boolean dateIndefinite
) {
}
