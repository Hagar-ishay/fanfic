CREATE TABLE IF NOT EXISTS "fanfiction"."epub_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanfic_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"epub_url" varchar NOT NULL,
	"md5_hash" varchar(32) NOT NULL,
	"ao3_updated_at" timestamp NOT NULL,
	"chapter_count" varchar,
	"chapter_boundaries" jsonb,
	"total_bytes" integer,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."koreader_highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_fanfic_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"highlight_text" text NOT NULL,
	"note_text" text,
	"chapter_title" varchar,
	"position_in_chapter" integer,
	"highlight_created_at" timestamp NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."koreader_sync_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"document_hash" varchar(32) NOT NULL,
	"fanfic_id" integer,
	"progress" integer NOT NULL,
	"percentage" real NOT NULL,
	"last_sync_at" timestamp DEFAULT now() NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."epub_cache" ADD CONSTRAINT "epub_cache_fanfic_id_fanfics_id_fk" FOREIGN KEY ("fanfic_id") REFERENCES "fanfiction"."fanfics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."epub_cache" ADD CONSTRAINT "epub_cache_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."koreader_highlights" ADD CONSTRAINT "koreader_highlights_section_fanfic_id_section_fanfics_id_fk" FOREIGN KEY ("section_fanfic_id") REFERENCES "fanfiction"."section_fanfics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."koreader_highlights" ADD CONSTRAINT "koreader_highlights_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."koreader_sync_state" ADD CONSTRAINT "koreader_sync_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."koreader_sync_state" ADD CONSTRAINT "koreader_sync_state_fanfic_id_fanfics_id_fk" FOREIGN KEY ("fanfic_id") REFERENCES "fanfiction"."fanfics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "epub_cache_user_fanfic_unique" ON "fanfiction"."epub_cache" USING btree ("user_id","fanfic_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "epub_cache_md5_hash_idx" ON "fanfiction"."epub_cache" USING btree ("md5_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "koreader_highlights_section_fanfic_created_idx" ON "fanfiction"."koreader_highlights" USING btree ("section_fanfic_id","highlight_created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "koreader_sync_user_device_doc_unique" ON "fanfiction"."koreader_sync_state" USING btree ("user_id","device_id","document_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "koreader_sync_user_doc_hash_idx" ON "fanfiction"."koreader_sync_state" USING btree ("user_id","document_hash");