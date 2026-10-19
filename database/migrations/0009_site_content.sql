-- D1 versioned public home page copy. No guest or login credentials are stored.
CREATE TABLE IF NOT EXISTS site_content (
 key TEXT NOT NULL, locale TEXT NOT NULL CHECK(locale IN ('id','en')),
 value TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(key,locale)
);
CREATE TABLE IF NOT EXISTS site_content_revisions (
 id TEXT PRIMARY KEY, key TEXT NOT NULL, locale TEXT NOT NULL,
 value TEXT NOT NULL, version INTEGER NOT NULL,
 published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_site_content_revisions ON site_content_revisions(key,locale,version);
