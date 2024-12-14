ALTER TABLE "fanfiction"."fanfics" ADD COLUMN "edditable_labels" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" ADD COLUMN "comment" varchar;--> statement-breakpoint
ALTER TABLE "fanfiction"."fanfics" DROP COLUMN IF EXISTS "rating";--> statement-breakpoint
DROP TYPE "fanfiction"."rating";