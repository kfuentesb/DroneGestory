package com.dronetools.dronegestory.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
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

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "documentation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<DocumentVersion> versions = new ArrayList<>();

    public OperationDocumentation(String name) {
        this.name = name;
    }

    public void addVersion(String fileUrl, String notes) {
        int nextVersion = versions.stream()
                .mapToInt(DocumentVersion::getVersionNumber)
                .max()
                .orElse(0) + 1;
        DocumentVersion newVersion = new DocumentVersion(this, nextVersion, fileUrl, notes);
        this.versions.add(newVersion);
    }
}
