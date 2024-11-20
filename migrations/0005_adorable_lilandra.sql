ALTER TABLE "fanfiction"."fanfics" ALTER COLUMN "fanficId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" ALTER COLUMN "author" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" ADD COLUMN "latest_starting_chapter" integer;