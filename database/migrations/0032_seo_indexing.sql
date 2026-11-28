CREATE TABLE IF NOT EXISTS seo_indexing_checks (
 url TEXT PRIMARY KEY, status TEXT NOT NULL CHECK(status IN ('INDEXED','NOT_INDEXED','ALTERNATE','UNKNOWN')),
 coverage TEXT, canonical TEXT, last_crawl TEXT, inspect_link TEXT, checked_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS seo_indexing_runs (
 hour_key TEXT PRIMARY KEY, started_at TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('RUNNING','DONE','ERROR')),
 checked INTEGER NOT NULL DEFAULT 0, error TEXT
);
