-- Owner-approved social campaign scheduler and measured feedback loop. Tourism D1 only.
-- Existing marketing_publications (legacy weekly Graph pilot) remains untouched/disabled.
CREATE TABLE IF NOT EXISTS approved_social_queue (
 id TEXT PRIMARY KEY,
 campaign_id TEXT NOT NULL REFERENCES campaign_drafts(id),
 platform TEXT NOT NULL CHECK(platform IN ('Instagram','Facebook')),
 photo_slug TEXT NOT NULL,
 caption_snapshot TEXT NOT NULL,
 image_url TEXT NOT NULL,
 scheduled_at TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('QUEUED','CREATING_MEDIA','AWAITING_CONTAINER','PUBLISHING','POSTED','REVIEW_REQUIRED','CANCELLED')),
 meta_container_id TEXT,
 meta_post_id TEXT,
 error_code TEXT NOT NULL DEFAULT '',
 attempted_at TEXT,
 published_at TEXT,
 last_insight_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(campaign_id,platform)
);
CREATE INDEX IF NOT EXISTS idx_approved_social_due ON approved_social_queue(status,scheduled_at);
CREATE INDEX IF NOT EXISTS idx_approved_social_insight ON approved_social_queue(status,last_insight_at,published_at);
CREATE TABLE IF NOT EXISTS approved_social_metrics (
 id TEXT PRIMARY KEY,
 queue_id TEXT NOT NULL REFERENCES approved_social_queue(id),
 observed_on TEXT NOT NULL,
 views INTEGER,
 reach INTEGER,
 reactions INTEGER,
 comments INTEGER,
 shares INTEGER,
 saves INTEGER,
 link_clicks INTEGER,
 data_status TEXT NOT NULL CHECK(data_status IN ('VERIFIED','PARTIAL','UNAVAILABLE')),
 error_code TEXT NOT NULL DEFAULT '',
 recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(queue_id,observed_on)
);
CREATE INDEX IF NOT EXISTS idx_approved_social_metrics_date ON approved_social_metrics(observed_on);
-- At most one next owner-review draft from one evaluated published post.
CREATE TABLE IF NOT EXISTS approved_social_learning (
 queue_id TEXT PRIMARY KEY REFERENCES approved_social_queue(id),
 new_campaign_id TEXT NOT NULL UNIQUE REFERENCES campaign_drafts(id),
 strategy_version TEXT NOT NULL,
 source_views INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
