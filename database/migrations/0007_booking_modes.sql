-- Shared and private are distinct operator rate contracts. Existing records are kept as LEGACY.
ALTER TABLE rates ADD COLUMN booking_mode TEXT NOT NULL DEFAULT 'LEGACY' CHECK(booking_mode IN ('LEGACY','SHARING','PRIVATE'));
ALTER TABLE rates ADD COLUMN private_fixed_net INTEGER NOT NULL DEFAULT 0 CHECK(private_fixed_net>=0);
ALTER TABLE rates ADD COLUMN sharing_guaranteed INTEGER NOT NULL DEFAULT 0 CHECK(sharing_guaranteed IN (0,1));
ALTER TABLE leads ADD COLUMN booking_mode TEXT NOT NULL DEFAULT 'LEGACY' CHECK(booking_mode IN ('LEGACY','SHARING','PRIVATE'));
ALTER TABLE quotes ADD COLUMN booking_mode TEXT NOT NULL DEFAULT 'LEGACY' CHECK(booking_mode IN ('LEGACY','SHARING','PRIVATE'));
CREATE INDEX IF NOT EXISTS idx_operator_mode_rates ON rates(operator_id,item_id,booking_mode,active,version DESC);
CREATE INDEX IF NOT EXISTS idx_leads_mode_date ON leads(booking_mode,requested_date);
