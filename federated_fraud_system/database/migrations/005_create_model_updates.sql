CREATE TABLE model_updates (
    update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL,
    bank_id UUID NOT NULL,
    update_s3_path TEXT NOT NULL,
    samples_used INTEGER,
    accuracy_local FLOAT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'SUBMITTED',

    CONSTRAINT fk_update_round
    FOREIGN KEY(round_id)
    REFERENCES training_rounds(round_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_update_bank
    FOREIGN KEY(bank_id)
    REFERENCES banks(bank_id)
);