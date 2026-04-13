package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseDocumentation {
    @Column(name = "documentation_type")
    private String documentationType;

    @Column(name = "documentation_name")
    private String documentationName;

    @Column(name = "expire_date")
    private LocalDate expireDate;

    @Column(name = "date_indefinite")
    private Boolean dateIndefinite;
}