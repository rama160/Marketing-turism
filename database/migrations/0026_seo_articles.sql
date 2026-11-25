-- Isolated additive article CMS; draft and public snapshots have independent media references.
CREATE TABLE IF NOT EXISTS seo_articles (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, draft_json TEXT NOT NULL, published_json TEXT,
 draft_media_id TEXT REFERENCES website_media(id) ON DELETE RESTRICT,
 published_media_id TEXT REFERENCES website_media(id) ON DELETE RESTRICT,
 version INTEGER NOT NULL DEFAULT 1, published_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_seo_articles_published ON seo_articles(published_at DESC);
