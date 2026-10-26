-- v3.12.0: consent-first marketing acquisition, no member scraping or automatic group posts.
CREATE TABLE IF NOT EXISTS acquisition_tasks (
 id TEXT PRIMARY KEY,
 intended_day TEXT NOT NULL,
 segment TEXT NOT NULL,
 channel TEXT NOT NULL CHECK(channel IN ('FACEBOOK_GROUP_SEARCH','PARTNER_SEARCH','CREATOR_SEARCH')),
 activity_id TEXT NOT NULL CHECK(activity_id IN ('SNORKELING_3_SPOTS','ISLAND_TOUR_CAR')),
 search_query TEXT NOT NULL,
 discovery_url TEXT NOT NULL,
 helpful_draft TEXT NOT NULL,
 action_tip TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'REVIEW' CHECK(status IN ('REVIEW','OWNER_APPROVED','DONE_MANUAL','DISMISSED')),
 actual_target_url TEXT NOT NULL DEFAULT '',
 published_url TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(intended_day,channel)
);
CREATE INDEX IF NOT EXISTS idx_acquisition_tasks_status ON acquisition_tasks(status,intended_day DESC);
CREATE TABLE IF NOT EXISTS acquisition_cta_clicks (
 observed_on TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source IN ('FLOATING','HERO','WEBSITE','CAMPAIGN_FACEBOOK','CAMPAIGN_INSTAGRAM','COMMUNITY','PARTNER')),
 campaign_id TEXT NOT NULL DEFAULT '',
 clicks INTEGER NOT NULL DEFAULT 0 CHECK(clicks >=0),
 PRIMARY KEY(observed_on,source,campaign_id)
);
CREATE INDEX IF NOT EXISTS idx_acquisition_cta_day ON acquisition_cta_clicks(observed_on DESC);
