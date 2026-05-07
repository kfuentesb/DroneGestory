package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "aircraft_model_documentation")
// SI SOLO QUEREMOS UNA DOCUMENTACION POR TIPO PARA CADA MODELO, DESCOMENTAR LA SIGUIENTE LINEA
// @Table(name = "aircraft_model_documentation", uniqueConstraints = {
//     @UniqueConstraint(columnNames = {"aircraft_model_id", "documentation_type"})
// })
@Getter
@Setter
@NoArgsConstructor
public class AircraftModelDocumentation extends BaseDocumentation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aircraft_model_documentation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aircraft_model_id", nullable = false)
    private AircraftModel aircraftModel;

    public String getFolderPath() {
        if (aircraftModel == null) return null;
        String safeModelName = aircraftModel.getModel().replaceAll(" ", "_");
        return "aircraft-model/" + aircraftModel.getId() + "-" + safeModelName + "/documentation";
    }

}