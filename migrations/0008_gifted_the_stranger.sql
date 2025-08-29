CREATE TABLE IF NOT EXISTS "fanfiction"."integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"name" varchar NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" RENAME COLUMN "kindle_email" TO "reader_email";--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" DROP CONSTRAINT "sections_parent_id_sections_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ADD COLUMN "enable_cloud_sync" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ADD COLUMN "cloud_sync_path" varchar;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ADD COLUMN "last_sync_time" timestamp;--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" ADD COLUMN "enable_cloud_sync" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" ADD COLUMN "cloud_sync_path" varchar DEFAULT '/KOReader/';--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" ADD COLUMN "active_integration_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."integrations" ADD CONSTRAINT "integrations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_integrations_type_name_unique" ON "fanfiction"."integrations" USING btree ("user_id","type","name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."settings" ADD CONSTRAINT "settings_active_integration_id_integrations_id_fk" FOREIGN KEY ("active_integration_id") REFERENCES "fanfiction"."integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
