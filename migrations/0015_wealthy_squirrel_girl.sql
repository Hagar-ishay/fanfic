ALTER TABLE "fanfiction"."koreader_sync_state" ADD COLUMN "current_chapter" integer;--> statement-breakpoint
ALTER TABLE "fanfiction"."koreader_sync_state" ADD COLUMN "percent_through_chapter" real;--> statement-breakpoint
ALTER TABLE "fanfiction"."koreader_sync_state" ADD COLUMN "last_read_paragraph" text;--> statement-breakpoint
ALTER TABLE "fanfiction"."koreader_sync_state" ADD COLUMN "total_chapters" integer;--> statement-breakpoint
ALTER TABLE "fanfiction"."koreader_sync_state" ADD COLUMN "ao3_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "fanfiction"."section_fanfics" ADD COLUMN "reading_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "fanfiction"."section_fanfics" ADD COLUMN "current_chapter" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "fanfiction"."section_fanfics" ADD COLUMN "last_read_at" timestamp;