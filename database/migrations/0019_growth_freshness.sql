-- Public-post publication and expiry metadata. Repeat-safe for deployment reruns.
-- Only public question timestamps/URLs: no account IDs, private profiles or visitor data.
CREATE TABLE IF NOT EXISTS growth_publication_meta(
 source_url TEXT PRIMARY KEY,
 published_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 CHECK(published_at <= expires_at)
);
CREATE INDEX IF NOT EXISTS idx_growth_publication_expiry ON growth_publication_meta(expires_at);
-- Pre-migration Reddit records lack verified publication dates and are excluded
-- from the active opportunities view by the join in growthOverview.
