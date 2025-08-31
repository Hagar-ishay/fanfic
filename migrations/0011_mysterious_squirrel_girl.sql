ALTER TABLE "fanfiction"."integrations" ADD COLUMN "category" varchar;

-- Populate existing records with appropriate categories
UPDATE "fanfiction"."integrations" 
SET "category" = CASE 
    WHEN "type" = 'email' THEN 'delivery'
    WHEN "type" IN ('google_drive', 'dropbox', 'webdav') THEN 'cloud_storage'
    ELSE 'unknown'
END;

-- Make the column NOT NULL after populating data
ALTER TABLE "fanfiction"."integrations" ALTER COLUMN "category" SET NOT NULL;