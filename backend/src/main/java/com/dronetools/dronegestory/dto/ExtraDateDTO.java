package com.dronetools.dronegestory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtraDateDTO {
    private Long idExtraDate;
    private LocalDate extraDate;
    private String description;
    private List<String> roles;
}