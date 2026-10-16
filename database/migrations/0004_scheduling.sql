-- Idempotent scheduling ledger, limited to own Marketing Turism database.
CREATE TABLE IF NOT EXISTS scheduled_runs(id TEXT PRIMARY KEY,kind TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
