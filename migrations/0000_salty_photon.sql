CREATE SCHEMA "fanfiction";
--> statement-breakpoint
CREATE TYPE "fanfiction"."rating" AS ENUM('MASTERPIECE', 'AMAZING', 'GOOD', 'OK', 'MEH');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."fanfics" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanficId" integer,
	"title" varchar NOT NULL,
	"summary" varchar,
	"author" varchar,
	"section_id" integer,
	"author_url" varchar,
	"source_url" varchar NOT NULL,
	"download_link" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"last_sent" timestamp,
	"tags" jsonb,
	"word_count" integer,
	"chapter_count" integer,
	"language" varchar,
	"rating" "fanfiction"."rating",
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"display_name" varchar,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."fanfics" ADD CONSTRAINT "fanfics_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "fanfiction"."sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

INSERT INTO "fanfiction"."sections" ("name", "display_name") VALUES 
	('READING', 'Reading') ,
	('COMPLETED', 'Completed'),
	('ABANDONED', 'Abandoned'),
	('SHELVED', 'Shelved'),
	('ARCHIVED', 'Archived')
	ON conflict do NOTHING

