CREATE TABLE IF NOT EXISTS "fanfiction"."section_fanfics" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"fanfic_id" integer NOT NULL,
	"position" integer NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp,
	"last_sent" timestamp,
	"latest_starting_chapter" integer,
	"edditable_labels" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP CONSTRAINT "fanfics_section_id_sections_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ADD COLUMN "user_id" varchar DEFAULT '0' NOT NULL ;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "fanfiction"."section_fanfics" ADD CONSTRAINT "section_fanfics_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "fanfiction"."sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."section_fanfics" ADD CONSTRAINT "section_fanfics_fanfic_id_fanfics_id_fk" FOREIGN KEY ("fanfic_id") REFERENCES "fanfiction"."fanfics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "section_fanfics_position_unique" ON "fanfiction"."section_fanfics" USING btree ("section_id","position");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."sections" ADD CONSTRAINT "sections_parent_id_sections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "fanfiction"."sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "section_id";--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "last_sent";--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "latest_starting_chapter";--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "edditable_labels";--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "sort_priority";--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "comment";