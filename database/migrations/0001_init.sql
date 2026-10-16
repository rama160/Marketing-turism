PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS operators(id TEXT PRIMARY KEY,name TEXT NOT NULL,contact TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'DRAFT',notes TEXT NOT NULL DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS activities(id TEXT PRIMARY KEY,title TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS rates(id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),item_id TEXT NOT NULL REFERENCES activities(id),unit TEXT NOT NULL CHECK(unit IN ('person','car')),net INTEGER NOT NULL CHECK(net>0),capacity INTEGER,verified INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,version INTEGER NOT NULL,effective_from TEXT DEFAULT CURRENT_TIMESTAMP,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_rates_operator ON rates(operator_id,item_id,version DESC);
CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY,name TEXT NOT NULL,contact TEXT NOT NULL,activity_id TEXT NOT NULL,guests INTEGER NOT NULL,requested_date TEXT NOT NULL,message TEXT NOT NULL DEFAULT '',consent INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'NEW',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS lead_limits(id TEXT PRIMARY KEY,amount INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,lead_id TEXT,operator_id TEXT NOT NULL,activity_id TEXT NOT NULL,guests INTEGER NOT NULL,requested_date TEXT NOT NULL,net INTEGER NOT NULL,minimum INTEGER NOT NULL,selling_price INTEGER NOT NULL,snapshot TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'DRAFT',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,quote_id TEXT NOT NULL UNIQUE REFERENCES quotes(id),status TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',payment_status TEXT NOT NULL DEFAULT 'UNPAID',reference TEXT,paid_at TEXT,handed_over_at TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_log(id TEXT PRIMARY KEY,entity TEXT NOT NULL,entity_id TEXT NOT NULL,action TEXT NOT NULL,detail TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO activities VALUES('SNORKELING_3_SPOTS','Snorkeling 3 Spot','ACTIVITY','Operator net Rp350.000 per orang, spot dan fasilitas belum diverifikasi');
INSERT OR IGNORE INTO activities VALUES('ISLAND_TOUR_CAR','Island Tour Nusa Penida','ACTIVITY','Net Rp600.000 per mobil, kapasitas 6 atau 7 tergantung konfirmasi');
INSERT OR IGNORE INTO activities VALUES('LUNCH','Lunch','ADDON','Net Rp150.000 per orang');
INSERT OR IGNORE INTO activities VALUES('BOAT_OUT','Fast Boat Bali ke Nusa Penida','ADDON','Net Rp150.000 per orang sekali jalan');
INSERT OR IGNORE INTO activities VALUES('BOAT_RETURN','Fast Boat kembali ke Bali','ADDON','Tarif pulang harus dikonfirmasi terpisah');
INSERT OR IGNORE INTO operators(id,name,status,notes) VALUES('DRAFT_OPERATOR','Operator Awal - Belum Terverifikasi','DRAFT','Tarif awal berasal dari pemilik, belum diverifikasi kepada operator');
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version) VALUES
('DRAFT_SNORKEL','DRAFT_OPERATOR','SNORKELING_3_SPOTS','person',350000,NULL,0,1,1),
('DRAFT_TOUR','DRAFT_OPERATOR','ISLAND_TOUR_CAR','car',600000,NULL,0,1,1),
('DRAFT_LUNCH','DRAFT_OPERATOR','LUNCH','person',150000,NULL,0,1,1),
('DRAFT_BOAT','DRAFT_OPERATOR','BOAT_OUT','person',150000,NULL,0,1,1);
