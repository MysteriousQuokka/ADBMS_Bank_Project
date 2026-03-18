CREATE TABLE training_rounds (
    round_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID,
    status VARCHAR(50) DEFAULT 'INITIALIZED',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    aggregated_model_path TEXT,

    CONSTRAINT fk_round_model
    FOREIGN KEY(model_id)
    REFERENCES models(model_id)
);