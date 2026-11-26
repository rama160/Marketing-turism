-- Bounded report cache, distinct from immutable final keyword snapshots.
CREATE TABLE IF NOT EXISTS seo_performance_reports(
 cache_key TEXT PRIMARY KEY, lock_id TEXT NOT NULL, started_at INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('RUNNING','DONE','PARTIAL','ERROR')),
 report_json TEXT NOT NULL DEFAULT '{}'
);
-- Latest safe provider diagnostic, no request URLs, response bodies or credentials.
CREATE TABLE IF NOT EXISTS growth_source_diagnostics(
 source TEXT PRIMARY KEY, checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 diagnostic_json TEXT NOT NULL DEFAULT '{}'
);
