CREATE TABLE models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL,
    s3_path TEXT NOT NULL,
    accuracy FLOAT,
    created_by UUID,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_model_creator
    FOREIGN KEY(created_by)
    REFERENCES users(user_id)
);