-- Additive WhatsApp Cloud API inbox, disabled until owner completes Meta onboarding.
-- Retain minimal verified guest messages; no token or webhook secret is stored here.
CREATE TABLE IF NOT EXISTS wa_inbox_messages (
 id TEXT PRIMARY KEY,
 phone TEXT NOT NULL,
 profile_name TEXT NOT NULL DEFAULT '',
 direction TEXT NOT NULL CHECK(direction IN ('IN','OUT')),
 body TEXT NOT NULL,
 received_at INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_inbox_phone_time ON wa_inbox_messages(phone,received_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_inbox_recent ON wa_inbox_messages(received_at DESC);
CREATE TABLE IF NOT EXISTS wa_outbox_requests (
 id TEXT PRIMARY KEY,
 phone TEXT NOT NULL,
 body TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('PENDING','SENT','FAILED')),
 external_id TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wa_outbox_recent ON wa_outbox_requests(phone,created_at DESC);
