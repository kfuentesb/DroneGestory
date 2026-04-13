package com.dronetools.dronegestory.dto;

public record AircraftDocumentationUploadRequest(
        String documentationType,
        String documentationLabel,
        String fileFieldKey,
        String expireDate,
        Boolean dateIndefinite,
        Boolean removeDefault
) {
}
