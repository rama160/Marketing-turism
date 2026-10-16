-- Marketing Turism: public lead launch controls. Additive, business details default incomplete.
CREATE TABLE IF NOT EXISTS business_profile(
 id INTEGER PRIMARY KEY CHECK(id=1),
 legal_name TEXT NOT NULL DEFAULT '',
 public_contact TEXT NOT NULL DEFAULT '',
 privacy_approved INTEGER NOT NULL DEFAULT 0,
 refund_policy_approved INTEGER NOT NULL DEFAULT 0,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO business_profile(id) VALUES(1);
