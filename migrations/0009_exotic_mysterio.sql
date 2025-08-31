CREATE TYPE "fanfiction"."sync_status" AS ENUM('pending', 'syncing', 'success', 'error');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."fanfic_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_fanfic_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_triggered" timestamp,
	"cloud_path" varchar,
	"sync_status" "fanfiction"."sync_status" DEFAULT 'pending' NOT NULL,
	"last_error" text,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."fanfic_integrations" ADD CONSTRAINT "fanfic_integrations_section_fanfic_id_section_fanfics_id_fk" FOREIGN KEY ("section_fanfic_id") REFERENCES "fanfiction"."section_fanfics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."fanfic_integrations" ADD CONSTRAINT "fanfic_integrations_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "fanfiction"."integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "section_fanfic_integration_unique" ON "fanfiction"."fanfic_integrations" USING btree ("section_fanfic_id","integration_id");--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" DROP COLUMN IF EXISTS "enable_cloud_sync";--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" DROP COLUMN IF EXISTS "cloud_sync_path";--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" DROP COLUMN IF EXISTS "last_sync_time";--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" DROP COLUMN IF EXISTS "enable_cloud_sync";--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" DROP COLUMN IF EXISTS "cloud_sync_path";