CREATE TABLE IF NOT EXISTS "fanfiction"."saved_searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"search" jsonb NOT NULL,
	"user_id" varchar NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_saved_searches_unique" ON "fanfiction"."saved_searches" USING btree ("user_id","name");