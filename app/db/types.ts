import { credentials, fanfics, savedSearches, sectionFanfics, sections } from "@/db/schema";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = typeof fanfics.$inferSelect;
export type SectionFanfic = typeof sectionFanfics.$inferSelect;
export type UserFanfic = Fanfic & SectionFanfic & { sectionName: string; sectionParentId: number | null };

export interface Tags {
  [key: string]: string[];
}
export type Section = typeof sections.$inferSelect;

export type Credentials = typeof credentials.$inferSelect;

const enumValues = {
  ao3: "AO3",
} as const;
export type SessionType = (typeof enumValues)[keyof typeof enumValues];

export type SavedSearch = typeof savedSearches.$inferSelect;

export type SavedSearchSearch = (typeof savedSearches.$inferSelect)["search"];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
