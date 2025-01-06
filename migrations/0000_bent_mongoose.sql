CREATE SCHEMA IF NOT EXISTS "fanfiction";
--> statement-breakpoint

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credentials_type') THEN
        CREATE TYPE "fanfiction"."credentials_type" AS ENUM('AO3');
    END IF;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "fanfiction"."credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "fanfiction"."credentials_type" NOT NULL,
	"session" jsonb,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "fanfiction"."fanfics" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanficId" integer NOT NULL,
	"title" varchar NOT NULL,
	"summary" varchar,
	"author" varchar NOT NULL,
	"author_url" varchar,
	"source_url" varchar NOT NULL,
	"download_link" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"tags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"word_count" integer,
	"chapter_count" varchar,
	"language" varchar,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "fanfiction"."section_fanfics" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"fanfic_id" integer NOT NULL,
	"position" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp,
	"last_sent" timestamp,
	"latest_starting_chapter" integer,
	"edditable_labels" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "fanfiction"."sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"parent_id" integer,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint

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

DO $$ BEGIN
 ALTER TABLE "fanfiction"."sections" ADD CONSTRAINT "sections_parent_id_sections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "fanfiction"."sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_type_unique" ON "fanfiction"."credentials" USING btree ("type");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "fanfics_fanfic_id_unique" ON "fanfiction"."fanfics" USING btree ("fanficId");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "section_fanfics_position_unique" ON "fanfiction"."section_fanfics" USING btree ("section_id","position");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "user_fanfics_unique" ON "fanfiction"."section_fanfics" USING btree ("user_id","fanfic_id");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "sections_id_name_unique" ON "fanfiction"."sections" USING btree ("user_id","name");