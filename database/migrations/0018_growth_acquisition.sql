-- v3.12 owner-governed, consent-based acquisition: no person lists, scraping or group posting.
CREATE TABLE IF NOT EXISTS growth_opportunities(
 id TEXT PRIMARY KEY,
 source TEXT NOT NULL CHECK(source IN ('REDDIT_PUBLIC_RSS','OSM_PUBLIC_BUSINESSES','OWNER_PARTNER')),
 source_url TEXT NOT NULL UNIQUE,
 headline TEXT NOT NULL CHECK(length(headline) BETWEEN 10 AND 240),
 theme TEXT NOT NULL CHECK(theme IN ('SNORKELING','ISLAND_TOUR','GENERAL','PARTNERSHIP')),
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
 suggested_reply TEXT NOT NULL CHECK(length(suggested_reply) BETWEEN 30 AND 1200),
 status TEXT NOT NULL DEFAULT 'REVIEW' CHECK(status IN ('REVIEW','SHORTLISTED','CONTACTED','RESPONDED','DISMISSED')),
 discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_growth_opps_status ON growth_opportunities(status,score DESC,discovered_at DESC);
CREATE TABLE IF NOT EXISTS growth_discovery_runs(
 id TEXT PRIMARY KEY,
 source TEXT NOT NULL,
 result TEXT NOT NULL CHECK(result IN ('FOUND','NO_MATCH','SOURCE_UNAVAILABLE')),
 candidates INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS growth_click_daily(
 day TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('WHATSAPP')),
 source TEXT NOT NULL,
 landing TEXT NOT NULL,
 count INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,kind,source,landing)
);
-- Deliberately no IP address, cookies, UTM payloads, profile IDs or visitor phone numbers.
