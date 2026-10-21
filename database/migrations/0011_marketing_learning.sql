-- v3.7.0 Additive, isolated tourism-only marketing learning. Never ingest guest identifiers.
CREATE TABLE IF NOT EXISTS marketing_observations (
 id TEXT PRIMARY KEY,
 platform TEXT NOT NULL CHECK(platform IN ('Instagram','Facebook','TikTok')),
 activity_id TEXT NOT NULL CHECK(activity_id IN ('SNORKELING_3_SPOTS','ISLAND_TOUR_CAR')),
 campaign_id TEXT REFERENCES campaign_drafts(id),
 observed_on TEXT NOT NULL,
 published_hour INTEGER CHECK(published_hour BETWEEN 0 AND 23),
 impressions INTEGER NOT NULL CHECK(impressions BETWEEN 0 AND 1000000000),
 reach INTEGER NOT NULL CHECK(reach BETWEEN 0 AND 1000000000),
 reactions INTEGER NOT NULL CHECK(reactions BETWEEN 0 AND 1000000000),
 comments INTEGER NOT NULL CHECK(comments BETWEEN 0 AND 1000000000),
 shares INTEGER NOT NULL CHECK(shares BETWEEN 0 AND 1000000000),
 saves INTEGER NOT NULL CHECK(saves BETWEEN 0 AND 1000000000),
 link_clicks INTEGER NOT NULL CHECK(link_clicks BETWEEN 0 AND 1000000000),
 source TEXT NOT NULL CHECK(source IN ('OWNER_VERIFIED','META_INSIGHTS','METRICOOL_EXPORT')),
 source_url TEXT NOT NULL DEFAULT '',
 recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_marketing_observations_group ON marketing_observations(platform,activity_id,observed_on DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_observations_hour ON marketing_observations(platform,published_hour,observed_on DESC);
CREATE TABLE IF NOT EXISTS marketing_decisions (
 id TEXT PRIMARY KEY,
 week_start TEXT NOT NULL,
 strategy_version TEXT NOT NULL,
 input_observations INTEGER NOT NULL DEFAULT 0,
 ranked_json TEXT NOT NULL,
 assumptions TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_marketing_decisions_week ON marketing_decisions(week_start);
