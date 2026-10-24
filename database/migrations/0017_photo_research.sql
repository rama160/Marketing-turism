-- Public Commons media research. Existing owner upload and scheduled Meta snapshots remain unchanged.
CREATE TABLE IF NOT EXISTS researched_photo_library (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL CHECK(activity_id IN ('SNORKELING_3_SPOTS','ISLAND_TOUR_CAR')),
 topic TEXT NOT NULL CHECK(length(topic) BETWEEN 2 AND 60),
 title TEXT NOT NULL,
 author TEXT NOT NULL,
 license TEXT NOT NULL CHECK(license IN ('CC BY 4.0','CC BY-SA 4.0','CC0')),
 license_url TEXT NOT NULL,
 source_url TEXT NOT NULL UNIQUE,
 source_file_url TEXT NOT NULL,
 sha256 TEXT NOT NULL UNIQUE,
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 10000 AND 850000),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_research_photo_topic ON researched_photo_library(activity_id,topic,created_at DESC);
CREATE TABLE IF NOT EXISTS photo_research_runs (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL,
 topic TEXT NOT NULL,
 outcome TEXT NOT NULL CHECK(outcome IN ('FOUND','LIBRARY_REUSE','EXTERNAL_UNAVAILABLE','NO_VALID_LICENSE','NOT_NEEDED')),
 source TEXT NOT NULL DEFAULT 'WIKIMEDIA_COMMONS',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_research_runs_created ON photo_research_runs(created_at);
