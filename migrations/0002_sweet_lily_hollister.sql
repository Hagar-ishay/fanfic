ALTER TABLE "fanfiction"."fanfics" ALTER COLUMN "tags" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" ALTER COLUMN "display_name" SET NOT NULL;