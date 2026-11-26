-- Separate, bounded Google Ads keyword planning reports, never GSC observations.
CREATE TABLE IF NOT EXISTS seo_keyword_planner_reports(
 market_key TEXT PRIMARY KEY, lock_id TEXT NOT NULL, started_at INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('RUNNING','DONE','PARTIAL','ERROR')),
 report_json TEXT NOT NULL DEFAULT '{}'
);
