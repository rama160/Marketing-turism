-- Additive, owner-only keyword planning and measured source snapshots.
CREATE TABLE IF NOT EXISTS seo_keyword_plans(
 id TEXT PRIMARY KEY, keyword TEXT NOT NULL, normalized TEXT NOT NULL, locale TEXT NOT NULL CHECK(locale IN ('id','en')),
 cluster TEXT NOT NULL, intent TEXT NOT NULL CHECK(intent IN ('BUY','PLAN','LEARN')), target_path TEXT NOT NULL DEFAULT '',
 priority INTEGER NOT NULL DEFAULT 2 CHECK(priority BETWEEN 1 AND 3), topic TEXT NOT NULL DEFAULT '',
 manual_json TEXT NOT NULL DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 origin TEXT NOT NULL CHECK(origin IN ('SEED','OWNER','GSC')), version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(normalized,locale)
);
CREATE TABLE IF NOT EXISTS seo_keyword_runs(
 id TEXT PRIMARY KEY, day TEXT NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 period_start TEXT, period_end TEXT, signal_json TEXT NOT NULL DEFAULT '{}', gsc_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
 gsc_rows INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS seo_keyword_runs_recent ON seo_keyword_runs(created_at DESC);
CREATE TABLE IF NOT EXISTS seo_keyword_observations(
 run_id TEXT NOT NULL REFERENCES seo_keyword_runs(id) ON DELETE CASCADE, query TEXT NOT NULL, normalized TEXT NOT NULL,
 path TEXT NOT NULL, clicks INTEGER NOT NULL, impressions INTEGER NOT NULL, position REAL NOT NULL,
 PRIMARY KEY(run_id,normalized,path)
);
CREATE INDEX IF NOT EXISTS seo_keyword_obs_run ON seo_keyword_observations(run_id,impressions DESC);
