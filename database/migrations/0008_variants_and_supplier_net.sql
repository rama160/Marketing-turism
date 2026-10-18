-- v3.0: preserve existing LEGACY price snapshots and extend mode-specific route variants.
ALTER TABLE rates ADD COLUMN variant_id TEXT NOT NULL DEFAULT 'DEFAULT';
ALTER TABLE rates ADD COLUMN pricing_scheme TEXT NOT NULL DEFAULT 'STANDARD'
 CHECK(pricing_scheme IN ('STANDARD','FIXED_PACKAGE','FIXED_VEHICLE'));
ALTER TABLE leads ADD COLUMN variant_id TEXT NOT NULL DEFAULT 'DEFAULT';
ALTER TABLE quotes ADD COLUMN variant_id TEXT NOT NULL DEFAULT 'DEFAULT';
CREATE INDEX IF NOT EXISTS idx_variant_rate ON rates(operator_id,item_id,booking_mode,variant_id,active,version DESC);
CREATE INDEX IF NOT EXISTS idx_lead_variant ON leads(activity_id,booking_mode,variant_id,requested_date);
-- Draft estimates supplied by business owner. Not bookable until the real operator is verified.
-- Snorkeling 3 spots Sharing: per guest, at most 20 with actual boat capacity checked.
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_SNORK_SHARING_200','DRAFT_OPERATOR','SNORKELING_3_SPOTS','person',200000,20,0,1,1,'SHARING',0,0,'STANDARD_3_SPOTS','STANDARD');
-- Private snorkeling prices are FULL BOAT / BOOKING, NOT person rate plus additional charter.
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_SNORK_PRIVATE_MANTA_BAY','DRAFT_OPERATOR','SNORKELING_3_SPOTS','person',1500000,NULL,0,1,1,'PRIVATE',0,0,'MANTA_BAY','FIXED_PACKAGE');
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_SNORK_PRIVATE_MANTA_POINT','DRAFT_OPERATOR','SNORKELING_3_SPOTS','person',2800000,NULL,0,1,1,'PRIVATE',0,0,'MANTA_POINT','FIXED_PACKAGE');
-- WEST and EAST tours: one vehicle Rp600,000 for 1 to 7 guests.
-- SHARING rates reserve full car financial exposure for THIS booking: not divided over unknown future buyers.
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_TOUR_WEST_PRIVATE','DRAFT_OPERATOR','ISLAND_TOUR_CAR','car',600000,7,0,1,1,'PRIVATE',0,0,'WEST','FIXED_VEHICLE');
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_TOUR_EAST_PRIVATE','DRAFT_OPERATOR','ISLAND_TOUR_CAR','car',600000,7,0,1,1,'PRIVATE',0,0,'EAST','FIXED_VEHICLE');
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_TOUR_WEST_SHARING','DRAFT_OPERATOR','ISLAND_TOUR_CAR','car',600000,7,0,1,1,'SHARING',0,0,'WEST','FIXED_VEHICLE');
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme)
VALUES('INITIAL_TOUR_EAST_SHARING','DRAFT_OPERATOR','ISLAND_TOUR_CAR','car',600000,7,0,1,1,'SHARING',0,0,'EAST','FIXED_VEHICLE');
UPDATE activities SET description='Sharing 3 spot: net draft Rp200.000/orang, kapasitas maks. 20; Private Manta Bay Rp1,5 juta/booking atau Manta Point Rp2,8 juta/booking. Spot yang dicapai tetap tergantung kondisi laut dan operator.' WHERE id='SNORKELING_3_SPOTS';
UPDATE activities SET description='Tour Barat/Timur: Private satu mobil atau Sharing dengan kalkulasi biaya mobil penuh Rp600.000/booking, maksimum 7 orang. Lunch/fast boat tambahan.' WHERE id='ISLAND_TOUR_CAR';
