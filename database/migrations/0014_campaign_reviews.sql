-- Owner review history; preserve original campaign_drafts CHECK and all audit trails.
-- Each rejected draft retains its identity, feedback, revision, and generated replacement.
CREATE TABLE IF NOT EXISTS campaign_review_records (
 campaign_id TEXT PRIMARY KEY REFERENCES campaign_drafts(id),
 media_slug TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0 AND revision <= 100),
 rejected_at TEXT,
 rejection_reason TEXT NOT NULL DEFAULT '',
 replacement_id TEXT REFERENCES campaign_drafts(id),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (rejected_at IS NULL OR replacement_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_campaign_review_replacement ON campaign_review_records(replacement_id);
