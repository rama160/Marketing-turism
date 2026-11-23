-- NPE Website CMS: additive, independent of immutable operator rates, leads and bookings.
-- Apply exactly once after migration 0022; never replay historic ALTER migrations.
CREATE TABLE IF NOT EXISTS website_media (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 alt_id TEXT NOT NULL,
 alt_en TEXT NOT NULL,
 digest TEXT NOT NULL UNIQUE,
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 10000 AND 850000),
 rights_confirmed INTEGER NOT NULL DEFAULT 1 CHECK(rights_confirmed=1),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS website_photo_slots (
 slot TEXT PRIMARY KEY CHECK(slot IN ('hero','snorkeling','island','west','east')),
 media_id TEXT NOT NULL REFERENCES website_media(id),
 alt_id TEXT NOT NULL,
 alt_en TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS website_activities (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 draft_json TEXT NOT NULL,
 published_json TEXT,
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
 version INTEGER NOT NULL DEFAULT 1,
 published_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS website_activity_revisions (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL REFERENCES website_activities(id),
 version INTEGER NOT NULL,
 snapshot_json TEXT NOT NULL,
 published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_website_activity_status ON website_activities(status,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_revisions ON website_activity_revisions(activity_id,version DESC);
