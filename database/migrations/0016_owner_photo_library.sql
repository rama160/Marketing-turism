-- Owner-uploaded photographs, separate from immutable vetted Wikimedia archive.
-- Binary stored in existing PHOTO_KV; D1 records only metadata and SHA256.
CREATE TABLE IF NOT EXISTS owner_photo_library (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL CHECK(activity_id IN ('SNORKELING_3_SPOTS','ISLAND_TOUR_CAR')),
 title TEXT NOT NULL CHECK(length(title) BETWEEN 2 AND 120),
 digest TEXT NOT NULL UNIQUE CHECK(length(digest)=64),
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 10000 AND 850000),
 content_type TEXT NOT NULL DEFAULT 'image/jpeg' CHECK(content_type='image/jpeg'),
 rights_confirmed INTEGER NOT NULL CHECK(rights_confirmed=1),
 credit TEXT NOT NULL DEFAULT 'Nusa Penida Experiences',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_owner_photo_activity ON owner_photo_library(activity_id,created_at DESC);
