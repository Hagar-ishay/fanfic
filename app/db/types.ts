import type { fanfics, sections } from "./schema";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = typeof fanfics.$inferSelect;
export interface Tags {
	[key: string]: string[];
}
export type Section = typeof sections.$inferSelect;
