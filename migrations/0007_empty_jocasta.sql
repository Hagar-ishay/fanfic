ALTER TABLE "fanfiction"."credentials" DROP COLUMN IF EXISTS "session_expiration_date";--> statement-breakpoint
ALTER TABLE "fanfiction"."credentials" DROP COLUMN IF EXISTS "session";
ALTER TABLE "fanfiction"."credentials" ADD COLUMN "session" jsonb;