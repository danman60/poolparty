-- Delete pools with null volume (spam/inactive pools)
DELETE FROM pool_snapshots WHERE pool_id IN (
  SELECT id FROM pools WHERE volume_usd_24h IS NULL
);
DELETE FROM pools WHERE volume_usd_24h IS NULL;
