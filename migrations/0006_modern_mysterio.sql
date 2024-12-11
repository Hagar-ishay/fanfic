CREATE TYPE "fanfiction"."credentials_type" AS ENUM('AO3');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "fanfiction"."credentials_type" NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"session_expiration_date" timestamp,
	"session" varchar,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_type_unique" ON "fanfiction"."credentials" USING btree ("type");