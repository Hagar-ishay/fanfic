ALTER TABLE "fanfiction"."fanfics" RENAME COLUMN "fanficId" TO "external_id";--> statement-breakpoint
DROP INDEX IF EXISTS "fanfics_fanfic_id_unique";--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "fanfics_external_id_unique" ON "fanfiction"."fanfics" USING btree ("external_id");--> statement-breakpoint
