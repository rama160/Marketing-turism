-- Marketing intelligence and consent-aware attribution (no automatic marketplace scraping).
CREATE TABLE IF NOT EXISTS campaign_drafts(
 id TEXT PRIMARY KEY, activity_id TEXT NOT NULL REFERENCES activities(id),
 platform TEXT NOT NULL, caption TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','APPROVED','PUBLISHED')),
 public_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS market_price_refs(
 id TEXT PRIMARY KEY, activity_id TEXT NOT NULL REFERENCES activities(id),
 platform TEXT NOT NULL, source_url TEXT NOT NULL DEFAULT '',
 net_or_sell TEXT NOT NULL DEFAULT 'SELL' CHECK(net_or_sell IN ('SELL')),
 unit TEXT NOT NULL CHECK(unit IN ('person','group')),
 group_size INTEGER, price INTEGER NOT NULL CHECK(price>0),
 inclusions TEXT NOT NULL DEFAULT '', observed_on TEXT NOT NULL,
 verified INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lead_attribution(
 lead_id TEXT PRIMARY KEY REFERENCES leads(id),
 campaign_id TEXT NOT NULL REFERENCES campaign_drafts(id),
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_campaign_status ON campaign_drafts(status,activity_id);
CREATE INDEX IF NOT EXISTS idx_market_activity ON market_price_refs(activity_id,observed_on DESC);
