ALTER TABLE "fanfiction"."accounts" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "fanfiction"."sessions" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "fanfiction"."users" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "fanfiction"."verification_tokens" RENAME TO "verificationToken";--> statement-breakpoint
ALTER TABLE "fanfiction"."session" DROP CONSTRAINT "sessions_session_token_unique";--> statement-breakpoint
ALTER TABLE "fanfiction"."user" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "fanfiction"."account" DROP CONSTRAINT "accounts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."saved_searches" DROP CONSTRAINT "saved_searches_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."section_fanfics" DROP CONSTRAINT "section_fanfics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."sections" DROP CONSTRAINT "sections_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."session" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."settings" DROP CONSTRAINT "settings_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."saved_searches" ADD CONSTRAINT "saved_searches_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."section_fanfics" ADD CONSTRAINT "section_fanfics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."sections" ADD CONSTRAINT "sections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."settings" ADD CONSTRAINT "settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "fanfiction"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "fanfiction"."session" ADD CONSTRAINT "session_session_token_unique" UNIQUE("session_token");--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");