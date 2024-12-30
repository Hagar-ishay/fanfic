DROP INDEX IF EXISTS "sections_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sections_id_name_unique" ON "fanfiction"."sections" USING btree ("user_id","name");
