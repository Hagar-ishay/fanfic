import {
  credentials,
  fanfics,
  savedSearches,
  sectionFanfics,
  sections,
  integrations,
  settings,
  fanficIntegrations,
} from "@/db/schema";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = typeof fanfics.$inferSelect;
export type SectionFanfic = typeof sectionFanfics.$inferSelect;
export type UserFanfic = Fanfic &
  SectionFanfic & { sectionName: string; sectionParentId: number | null };

export interface Tags {
  [key: string]: string[];
}
export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type FanficIntegration = typeof fanficIntegrations.$inferSelect;
export type NewFanficIntegration = typeof fanficIntegrations.$inferInsert;

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Credentials = typeof credentials.$inferSelect;

export type SessionType = "AO3";

export type SavedSearch = typeof savedSearches.$inferSelect;

export type SavedSearchSearch = (typeof savedSearches.$inferSelect)["search"];

export type UserFanficIntegration = {
  fanficIntegrationId: number;
  sectionFanficId: number;
  integrationId: number;
  lastTriggered: Date | null;
  syncStatus: "pending" | "syncing" | "success" | "error";
  cloudPath: string | null;
  enabled: boolean;
  fanfic: {
    id: number;
    externalId: number;
    title: string;
    author: string;
    updatedAt: Date;
    downloadLink: string | null;
  };
  section: {
    id: number;
    name: string;
    userId: string;
  };
  integration: {
    id: number;
    name: string;
    type: string;
    config: Record<string, unknown>;
  };
};

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
