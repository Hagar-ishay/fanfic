import type { credentials, fanfics, sections, sectionFanfics } from "./schema";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = typeof fanfics.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type SectionFanfic = typeof sectionFanfics.$inferSelect;
export type Credentials = typeof credentials.$inferSelect;
export type UserSection = {
  fanfics: Fanfic;
  sections: Section;
  section_fanfics: SectionFanfic;
};
export type UserFanfic = Fanfic & SectionFanfic;

export interface Tags {
  [key: string]: string[];
}

const enumValues = {
  ao3: "AO3",
} as const;
export type SessionType = (typeof enumValues)[keyof typeof enumValues];
