CREATE TABLE IF NOT EXISTS "fanfiction"."settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"kindle_email" varchar,
	"language_code" varchar DEFAULT 'en' NOT NULL,
	"enable_translation" boolean DEFAULT false NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp
);
