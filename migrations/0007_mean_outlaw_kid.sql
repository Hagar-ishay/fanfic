CREATE TABLE IF NOT EXISTS "fanfiction"."authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
ALTER TABLE "fanfiction"."account" RENAME COLUMN "id" TO "userId";--> statement-breakpoint
ALTER TABLE "fanfiction"."account" RENAME COLUMN "user_id" TO "providerAccountId";--> statement-breakpoint
ALTER TABLE "fanfiction"."session" RENAME COLUMN "id" TO "sessionToken";--> statement-breakpoint
ALTER TABLE "fanfiction"."session" RENAME COLUMN "session_token" TO "userId";--> statement-breakpoint
ALTER TABLE "fanfiction"."user" RENAME COLUMN "email_verified" TO "emailVerified";--> statement-breakpoint
ALTER TABLE "fanfiction"."session" DROP CONSTRAINT "session_session_token_unique";--> statement-breakpoint
ALTER TABLE "fanfiction"."account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "fanfiction"."session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "verification_tokens_identifier_token_idx";--> statement-breakpoint
ALTER TABLE "fanfiction"."account" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."account" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."account" ALTER COLUMN "token_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."account" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."account" ALTER COLUMN "session_state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "fanfiction"."user" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."verificationToken" ALTER COLUMN "identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fanfiction"."verificationToken" ALTER COLUMN "token" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "fanfiction"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "fanfiction"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "fanfiction"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "fanfiction"."account" DROP COLUMN IF EXISTS "provider_account_id";--> statement-breakpoint
ALTER TABLE "fanfiction"."session" DROP COLUMN IF EXISTS "user_id";