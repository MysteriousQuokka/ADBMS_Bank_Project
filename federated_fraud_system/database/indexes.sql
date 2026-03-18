CREATE INDEX idx_model_updates_round
ON model_updates(round_id);

CREATE INDEX idx_model_updates_bank
ON model_updates(bank_id);

CREATE INDEX idx_training_round_model
ON training_rounds(model_id);