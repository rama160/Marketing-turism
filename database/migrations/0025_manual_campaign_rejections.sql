-- Manual campaign rejection without generating a successor. Historical reviews remain intact.
CREATE TABLE IF NOT EXISTS campaign_manual_rejections (
 campaign_id TEXT PRIMARY KEY REFERENCES campaign_drafts(id),
 media_slug TEXT NOT NULL,
 rejected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 rejection_reason TEXT NOT NULL CHECK(length(rejection_reason)>=3)
);
CREATE VIEW IF NOT EXISTS campaign_review_effective AS
 SELECT c.id AS campaign_id,COALESCE(r.media_slug,m.media_slug) AS media_slug,
 COALESCE(r.revision,0) AS revision,COALESCE(r.rejected_at,m.rejected_at) AS rejected_at,
 COALESCE(m.rejection_reason,r.rejection_reason,'') AS rejection_reason,r.replacement_id,
 COALESCE(r.created_at,m.rejected_at) AS created_at
 FROM campaign_drafts c LEFT JOIN campaign_review_records r ON r.campaign_id=c.id
 LEFT JOIN campaign_manual_rejections m ON m.campaign_id=c.id
 WHERE r.campaign_id IS NOT NULL OR m.campaign_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_campaign_reject_once
 ON audit_log(entity,entity_id) WHERE action='REJECTED';
