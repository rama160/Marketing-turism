-- Additive consent-first discovery across approved public/owned surfaces.
-- Keep legacy Reddit+OSM records intact; no destructive constraint changes.
CREATE TABLE IF NOT EXISTS growth_network_opportunities(
 id TEXT PRIMARY KEY,
 source TEXT NOT NULL CHECK(source IN ('BLUESKY_PUBLIC','FACEBOOK_PAGE_COMMENTS','INSTAGRAM_MEDIA_COMMENTS','YOUTUBE_PUBLIC_VIDEO')),
 source_url TEXT NOT NULL UNIQUE,
 headline TEXT NOT NULL CHECK(length(headline) BETWEEN 12 AND 240),
 theme TEXT NOT NULL CHECK(theme IN ('SNORKELING','ISLAND_TOUR','GENERAL')),
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
 suggested_reply TEXT NOT NULL CHECK(length(suggested_reply) BETWEEN 30 AND 1200),
 status TEXT NOT NULL DEFAULT 'REVIEW' CHECK(status IN ('REVIEW','SHORTLISTED','CONTACTED','RESPONDED','DISMISSED')),
 published_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_growth_network_active ON growth_network_opportunities(expires_at,status,score DESC);
-- Only source URL, short question text and publication time; no accounts, contacts or private DMs.
