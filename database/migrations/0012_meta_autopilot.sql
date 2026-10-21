-- Nusa Penida Experiences: opt-in independent Meta publishing ledger.
-- Additive schema, no personal data. Platform calls are never retried after ATTEMPTED.
CREATE TABLE IF NOT EXISTS marketing_publications (
 id TEXT PRIMARY KEY,
 week_start TEXT NOT NULL,
 intended_date TEXT NOT NULL,
 idea_index INTEGER NOT NULL CHECK(idea_index BETWEEN 0 AND 6),
 status TEXT NOT NULL DEFAULT 'READY' CHECK(status IN ('READY','ATTEMPTED','POSTED','REVIEW_REQUIRED')),
 facebook_post_id TEXT,
 instagram_container_id TEXT,
 instagram_post_id TEXT,
 error_reason TEXT NOT NULL DEFAULT '',
 attempted_at TEXT,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(week_start,intended_date)
);
CREATE INDEX IF NOT EXISTS idx_marketing_publications_pending ON marketing_publications(intended_date,status);
