package com.dronetools.dronegestory.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class InsuranceCompanyRequestDTO {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long amount;
}