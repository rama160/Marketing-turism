-- Owner-only durable sessions. Store SHA-256 hashes of random 256-bit cookie values, not the admin token.
CREATE TABLE IF NOT EXISTS owner_sessions (
 session_hash TEXT PRIMARY KEY NOT NULL CHECK(length(session_hash)=64),
 credential_digest TEXT NOT NULL CHECK(length(credential_digest)=64),
 created_at INTEGER NOT NULL,
 last_seen_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_owner_sessions_expiry ON owner_sessions(expires_at,revoked_at);
