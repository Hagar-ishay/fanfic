import { fanfics, sections } from "@/db/schema";
import type { NewFanfic } from "@/db/types";
import { ENV } from "@/server/config";
import * as drizz from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const db = drizzle(ENV.DATABASE_URL!);

export const insertFanfic = async (fanfic: NewFanfic) => {
	return db.insert(fanfics).values(fanfic);
};

export const deleteFanfic = async (ficId: number) => {
	return await db
		.delete(fanfics)
		.where(drizz.eq(fanfics.id, ficId))
		.returning({ fanficId: fanfics.id });
};

export const updateFanfic = async (ficId: number, { ...update }) => {
	return await db
		.update(fanfics)
		.set(update)
		.where(drizz.eq(fanfics.id, ficId))
		.returning({ fanficId: fanfics.id });
};

export const selectFanfics = async (sectionId: number) => {
	return await db
		.select()
		.from(fanfics)
		.where(drizz.eq(fanfics.sectionId, sectionId));
};

export const selectSections = async () => {
	return await db.select().from(sections);
};

export const getSectionByName = async (name: string) => {
	return await db.select().from(sections).where(drizz.eq(sections.name, name));
};
