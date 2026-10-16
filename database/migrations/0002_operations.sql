-- Idempotent operations extension. Do not mutate historical rate versions or quote snapshots.
CREATE TABLE IF NOT EXISTS booking_manifest (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id),
 guest_name TEXT NOT NULL,
 guest_contact TEXT NOT NULL,
 pickup TEXT NOT NULL DEFAULT '',
 special_notes TEXT NOT NULL DEFAULT '',
 confirmed INTEGER NOT NULL DEFAULT 0,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS booking_payables (
 booking_id TEXT NOT NULL REFERENCES bookings(id),
 operator_id TEXT NOT NULL REFERENCES operators(id),
 net_amount INTEGER NOT NULL CHECK(net_amount > 0),
 status TEXT NOT NULL DEFAULT 'DUE' CHECK(status IN ('DUE','PAID','ON_HOLD')),
 reference TEXT,
 paid_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(booking_id,operator_id)
);
CREATE TABLE IF NOT EXISTS booking_changes (
 id TEXT PRIMARY KEY,
 booking_id TEXT NOT NULL REFERENCES bookings(id),
 change_type TEXT NOT NULL CHECK(change_type IN ('RESCHEDULE','CANCEL','REFUND')),
 status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','APPROVED','REJECTED','EXECUTED')),
 requested_date TEXT,
 refund_amount INTEGER NOT NULL DEFAULT 0 CHECK(refund_amount >= 0),
 reason TEXT NOT NULL,
 external_reference TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS booking_schedule (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id),
 service_date TEXT NOT NULL,
 changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 change_id TEXT NOT NULL REFERENCES booking_changes(id)
);
CREATE INDEX IF NOT EXISTS idx_booking_changes ON booking_changes(booking_id,created_at);
CREATE INDEX IF NOT EXISTS idx_payables_status ON booking_payables(status,operator_id);
