CREATE TABLE IF NOT EXISTS "fanfiction"."accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"provider_account_id" varchar NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar,
	"scope" varchar,
	"id_token" text,
	"session_state" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"session_token" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar NOT NULL,
	"email_verified" timestamp,
	"image" varchar,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"update_time" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
insert into "fanfiction"."users" ("id", "name", "email", "email_verified", "image", "creation_time", "update_time") values ('user_2oxyo33k44Igt2jyVgDWSdWOm5K', 'Hagar Ishay', 'hagari0297@gmail.com', null, null, now(), null);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fanfiction"."verification_tokens" (
	"identifier" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL
);

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_idx" ON "fanfiction"."verification_tokens" USING btree ("identifier","token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."section_fanfics" ADD CONSTRAINT "section_fanfics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."sections" ADD CONSTRAINT "sections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
