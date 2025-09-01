ALTER TABLE "fanfiction"."settings" ADD COLUMN "default_section_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fanfiction"."settings" ADD CONSTRAINT "settings_default_section_id_sections_id_fk" FOREIGN KEY ("default_section_id") REFERENCES "fanfiction"."sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
