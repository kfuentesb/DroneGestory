package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "operation_documentation")
@Getter 
@Setter 
@NoArgsConstructor
public class OperationDocumentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String name;

    // Relación con las versiones, ordenadas por el número de versión
    @OneToMany(mappedBy = "documentation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<DocumentVersion> versions = new ArrayList<>();

    public OperationDocumentation(String name) {
        this.name = name;
    }

    // Método de conveniencia para añadir versiones
    public void addVersion(String fileUrl, String notes) {
        int nextVersion = versions.isEmpty() ? 1 : versions.get(0).getVersionNumber() + 1;
        DocumentVersion newVersion = new DocumentVersion(this, nextVersion, fileUrl, notes);
        this.versions.add(0, newVersion); // Añadir al inicio por el orden DESC
    }
}