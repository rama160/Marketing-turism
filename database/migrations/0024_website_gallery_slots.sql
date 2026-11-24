-- Add optional per-spot website gallery photo placements. Existing five home slots remain untouched.
CREATE TABLE IF NOT EXISTS website_gallery_photo_slots(
 slot TEXT PRIMARY KEY,
 media_id TEXT NOT NULL REFERENCES website_media(id),
 alt_id TEXT NOT NULL,
 alt_en TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_website_gallery_photo_media ON website_gallery_photo_slots(media_id);

-- Owner-managed website-only categories; independent of booking catalog.
CREATE TABLE IF NOT EXISTS website_custom_categories(
 category TEXT PRIMARY KEY,
 name TEXT NOT NULL COLLATE NOCASE UNIQUE,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
