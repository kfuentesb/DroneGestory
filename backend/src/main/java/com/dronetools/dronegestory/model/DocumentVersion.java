package com.dronetools.dronegestory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_versions")
@Getter 
@Setter 
@NoArgsConstructor
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documentation_id", nullable = false)
    private OperationDocumentation documentation;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(nullable = false)
    private String fileUrl;

    private String uploadNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public DocumentVersion(OperationDocumentation documentation, Integer versionNumber, String fileUrl, String notes) {
        this.documentation = documentation;
        this.versionNumber = versionNumber;
        this.fileUrl = fileUrl;
        this.uploadNotes = notes;
        this.createdAt = LocalDateTime.now();
    }
}