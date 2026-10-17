-- Pilot business brand can differ from legally verified business name.
ALTER TABLE business_profile ADD COLUMN trade_brand TEXT NOT NULL DEFAULT 'Penivara Experiences';
ALTER TABLE booking_changes ADD COLUMN penalty_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_changes ADD COLUMN cancellation_policy_version TEXT;
ALTER TABLE booking_changes ADD COLUMN cancellation_cause TEXT;
-- Boat outbound and return net confirmed by business owner, initial partner still DRAFT.
INSERT OR IGNORE INTO rates(id,operator_id,item_id,unit,net,capacity,verified,active,version)
VALUES('DRAFT_BOAT_RETURN_2026','DRAFT_OPERATOR','BOAT_RETURN','person',150000,NULL,0,1,1);
