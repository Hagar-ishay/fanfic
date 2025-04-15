import {
  boolean,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const schema = pgSchema("fanfiction");

export const credentialsType = schema.enum("credentials_type", ["AO3"]);

// Auth.js / NextAuth.js tables
export const users = schema.table("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  creationTime: timestamp("creation_time").notNull().defaultNow(),
  updateTime: timestamp("update_time").$onUpdate(() => new Date()),
});

export const accounts = schema.table(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = schema.table("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = schema.table(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = schema.table(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

// Existing tables
export const sections = schema.table(
  "sections",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    parentId: integer("parent_id").references((): any => sections.id),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    sectionFanficsUnique: uniqueIndex("sections_id_name_unique").on(table.userId, table.name),
  })
);

export const fanfics = schema.table(
  "fanfics",
  {
    id: serial().primaryKey(),
    externalId: integer("external_id").notNull().unique(),
    title: varchar().notNull(),
    summary: varchar(),
    author: varchar().notNull(),
    authorUrl: varchar("author_url"),
    sourceUrl: varchar("source_url").notNull(),
    downloadLink: varchar("download_link").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    completedAt: timestamp("completed_at"),
    tags: jsonb().$type<{ [category: string]: string[] }>().notNull().default({}),
    wordCount: integer("word_count"),
    chapterCount: varchar("chapter_count"),
    language: varchar(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    fanficsExternalIdUnique: uniqueIndex("fanfics_external_id_unique").on(table.externalId),
  })
);

export const sectionFanfics = schema.table(
  "section_fanfics",
  {
    id: serial().primaryKey(),
    sectionId: integer("section_id")
      .references(() => sections.id)
      .notNull(),
    fanficId: integer("fanfic_id")
      .references(() => fanfics.id)
      .notNull(),
    position: integer().notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    kudos: boolean("kudos").default(false),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
    lastSent: timestamp("last_sent"),
    latestStartingChapter: integer("latest_starting_chapter"),
    editableLabels: jsonb("edditable_labels").$type<string[]>().default([]).notNull(),
  },
  (table) => ({
    sectionFanficsUniquePosition: uniqueIndex("section_fanfics_position_unique").on(table.sectionId, table.position),
    sectionFanficsUnique: uniqueIndex("user_fanfics_unique").on(table.userId, table.fanficId),
  })
);

export const credentials = schema.table(
  "credentials",
  {
    id: serial().primaryKey(),
    type: credentialsType().notNull(),
    session: jsonb().$type<{ key: string; value: string; expires: Date | null | "Infinity" }[]>(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    sessionTypeUnique: uniqueIndex("sessions_type_unique").on(table.type),
  })
);

export const savedSearches = schema.table(
  "saved_searches",
  {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    search: jsonb()
      .$type<{
        [name: string]:
          | { id: string; name: string; excluded?: boolean }
          | { id: string; name: string; excluded?: boolean }[];
      }>()
      .notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    savedSearchesUnique: uniqueIndex("user_saved_searches_unique").on(table.userId, table.name),
  })
);

export const settings = schema.table("settings", {
  id: serial().primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  kindleEmail: varchar("kindle_email"),
  languageCode: varchar("language_code").notNull().default("en"),
  enableTranslation: boolean("enable_translation").notNull().default(false),
  creationTime: timestamp("creation_time").notNull().defaultNow(),
  updateTime: timestamp("update_time").$onUpdate(() => new Date()),
});
