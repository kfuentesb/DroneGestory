package com.dronetools.dronegestory.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OperatorRequestDTO {
    private String name;
    private Integer fiscalId;
    private Integer operatorNumber;
    private Integer ridSecretCode;
    private String easaCertificatePath;
    private String nonEasaCertificatePath;
    private String address;
    private Integer postalCode;
    private String city;
    private String province;
    private String email;
    private Integer phoneNumber;
}