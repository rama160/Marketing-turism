CREATE TABLE IF NOT EXISTS website_reviews (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, body TEXT NOT NULL,
 service TEXT NOT NULL CHECK(service IN ('WEST','EAST','SNORKELING','LEMBONGAN','FAST_BOAT','OTHER')),
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 visible INTEGER NOT NULL DEFAULT 1 CHECK(visible IN (0,1)),
 version INTEGER NOT NULL DEFAULT 1, rate_key TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS website_reviews_public_idx ON website_reviews(visible,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS website_reviews_rate_idx ON website_reviews(rate_key);
