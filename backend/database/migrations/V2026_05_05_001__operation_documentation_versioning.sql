CREATE TABLE IF NOT EXISTS operation_documentation (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS document_versions (
    id BIGSERIAL PRIMARY KEY,
    documentation_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    upload_notes VARCHAR(2048),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_document_versions_operation_documentation
        FOREIGN KEY (documentation_id)
        REFERENCES operation_documentation(id)
        ON DELETE CASCADE,
    CONSTRAINT uk_document_versions_documentation_version
        UNIQUE (documentation_id, version_number)
);
