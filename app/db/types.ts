import type { credentials, fanfics, sections } from "./schema";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = typeof fanfics.$inferSelect;
export interface Tags {
  [key: string]: string[];
}
export type Section = typeof sections.$inferSelect;

export type Credentials = typeof credentials.$inferSelect;

const enumValues = {
  ao3: "AO3",
} as const;
export type SessionType = (typeof enumValues)[keyof typeof enumValues];
