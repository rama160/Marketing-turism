-- Internal read-only Meta connectivity diagnostic, one sanitized snapshot per UTC day.
-- No credentials, headers, Meta response bodies, PII, posts or marketing metrics.
CREATE TABLE IF NOT EXISTS meta_connection_checks (
  day TEXT PRIMARY KEY,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL CHECK(source IN ('DAILY_CRON','OWNER_BUTTON')),
  configured INTEGER NOT NULL CHECK(configured IN (0,1)),
  page_ok INTEGER NOT NULL CHECK(page_ok IN (0,1)),
  instagram_ok INTEGER NOT NULL CHECK(instagram_ok IN (0,1)),
  page_http_status INTEGER,
  instagram_http_status INTEGER,
  result TEXT NOT NULL CHECK(result IN ('READ_OK','READ_PARTIAL','READ_FAILED','INCOMPLETE'))
);
CREATE INDEX IF NOT EXISTS idx_meta_connection_checks_time ON meta_connection_checks(checked_at DESC);
