-- Owner-curated Facebook Group research. NO Groups API, scraping or automatic social writes.
-- Community records contain only group names, public group URLs and owner-written rule summaries.
CREATE TABLE IF NOT EXISTS growth_facebook_groups(
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 group_url TEXT NOT NULL UNIQUE,
 destination TEXT NOT NULL CHECK(destination IN ('NUSA_PENIDA','NUSA_LEMBONGAN')),
 rules_note TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'RESEARCH' CHECK(status IN ('RESEARCH','JOINED_MANUALLY','NO_PROMOTION','DISMISSED')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Questions are OWNER-PARAPHRASED PUBLIC post references, never scraped or user profiles.
CREATE TABLE IF NOT EXISTS growth_facebook_questions(
 id TEXT PRIMARY KEY,
 group_id TEXT NOT NULL REFERENCES growth_facebook_groups(id),
 source_url TEXT NOT NULL UNIQUE,
 headline TEXT NOT NULL,
 destination TEXT NOT NULL CHECK(destination IN ('NUSA_PENIDA','NUSA_LEMBONGAN')),
 theme TEXT NOT NULL CHECK(theme IN ('SNORKELING','ISLAND_TOUR','GENERAL')),
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
 suggested_reply TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'REVIEW' CHECK(status IN ('REVIEW','SHORTLISTED','CONTACTED','RESPONDED','DISMISSED')),
 published_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_growth_facebook_expiry ON growth_facebook_questions(expires_at,status,score DESC);
