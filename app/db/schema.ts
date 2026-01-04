import {
  boolean,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const schema = pgSchema("fanfiction");

export const credentialsType = schema.enum("credentials_type", ["AO3"]);

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

export const sections = schema.table(
  "sections",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    parentId: integer("parent_id"),
    enableIntegrationCleanup: boolean("enable_integration_cleanup").notNull().default(false),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    sectionFanficsUnique: uniqueIndex("sections_id_name_unique").on(
      table.userId,
      table.name
    ),
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
    tags: jsonb()
      .$type<{ [category: string]: string[] }>()
      .notNull()
      .default({}),
    wordCount: integer("word_count"),
    chapterCount: varchar("chapter_count"),
    language: varchar(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    fanficsExternalIdUnique: uniqueIndex("fanfics_external_id_unique").on(
      table.externalId
    ),
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
    latestStartingChapter: integer("latest_starting_chapter"),
    editableLabels: jsonb("edditable_labels")
      .$type<string[]>()
      .default([])
      .notNull(),
    readingProgress: integer("reading_progress").default(0).notNull(),
    currentChapter: integer("current_chapter").default(1).notNull(),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => ({
    sectionFanficsUniquePosition: uniqueIndex(
      "section_fanfics_position_unique"
    ).on(table.sectionId, table.position),
    sectionFanficsUnique: uniqueIndex("user_fanfics_unique").on(
      table.userId,
      table.fanficId
    ),
  })
);

export const credentials = schema.table(
  "credentials",
  {
    id: serial().primaryKey(),
    type: credentialsType().notNull(),
    session:
      jsonb().$type<
        { key: string; value: string; expires: Date | null | "Infinity" }[]
      >(),
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
    savedSearchesUnique: uniqueIndex("user_saved_searches_unique").on(
      table.userId,
      table.name
    ),
  })
);

export const integrations = schema.table(
  "integrations",
  {
    id: serial().primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    type: varchar("type").notNull(),
    name: varchar("name").notNull(),
    category: varchar("category").notNull(),
    config: jsonb("config").$type<Record<string, string>>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    userTypeUnique: uniqueIndex("user_integrations_type_name_unique").on(
      table.userId,
      table.type,
      table.name
    ),
  })
);

export const syncStatus = schema.enum("sync_status", [
  "pending",
  "syncing",
  "success",
  "error",
]);

export const fanficIntegrations = schema.table(
  "fanfic_integrations",
  {
    id: serial().primaryKey(),
    sectionFanficId: integer("section_fanfic_id")
      .notNull()
      .references(() => sectionFanfics.id),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id),
    enabled: boolean("enabled").notNull().default(true),
    lastTriggered: timestamp("last_triggered"),
    cloudPath: varchar("cloud_path"),
    syncStatus: syncStatus("sync_status").notNull().default("pending"),
    lastError: text("last_error"),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    sectionFanficIntegrationUnique: uniqueIndex(
      "section_fanfic_integration_unique"
    ).on(table.sectionFanficId, table.integrationId),
  })
);

// KOReader Integration Tables

export const epubCache = schema.table(
  "epub_cache",
  {
    id: serial().primaryKey(),
    fanficId: integer("fanfic_id")
      .notNull()
      .references(() => fanfics.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    epubUrl: varchar("epub_url").notNull(),
    md5Hash: varchar("md5_hash", { length: 32 }).notNull(),
    ao3UpdatedAt: timestamp("ao3_updated_at").notNull(),
    chapterCount: varchar("chapter_count"),
    chapterBoundaries: jsonb("chapter_boundaries").$type<
      Record<string, number>
    >(),
    totalBytes: integer("total_bytes"),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    userFanficUnique: uniqueIndex("epub_cache_user_fanfic_unique").on(
      table.userId,
      table.fanficId
    ),
    md5HashIndex: uniqueIndex("epub_cache_md5_hash_idx").on(table.md5Hash),
  })
);

export const koreaderSyncState = schema.table(
  "koreader_sync_state",
  {
    id: serial().primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    deviceId: varchar("device_id").notNull(),
    documentHash: varchar("document_hash", { length: 32 }).notNull(),
    fanficId: integer("fanfic_id").references(() => fanfics.id),
    progress: integer("progress").notNull(),
    percentage: real("percentage").notNull(),

    // Smart sync fields - survive EPUB updates
    currentChapter: integer("current_chapter"),
    percentThroughChapter: real("percent_through_chapter"),
    lastReadParagraph: text("last_read_paragraph"), // Text anchor for precise restoration
    totalChapters: integer("total_chapters"), // Track chapter count when last read
    ao3UpdatedAt: timestamp("ao3_updated_at"), // Detect if fanfic updated

    lastSyncAt: timestamp("last_sync_at").notNull().defaultNow(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    userDeviceDocUnique: uniqueIndex(
      "koreader_sync_user_device_doc_unique"
    ).on(table.userId, table.deviceId, table.documentHash),
    userDocHashIndex: uniqueIndex("koreader_sync_user_doc_hash_idx").on(
      table.userId,
      table.documentHash
    ),
  })
);

export const koreaderHighlights = schema.table(
  "koreader_highlights",
  {
    id: serial().primaryKey(),
    sectionFanficId: integer("section_fanfic_id")
      .notNull()
      .references(() => sectionFanfics.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    highlightText: text("highlight_text").notNull(),
    noteText: text("note_text"),
    chapterTitle: varchar("chapter_title"),
    positionInChapter: integer("position_in_chapter"),
    highlightCreatedAt: timestamp("highlight_created_at").notNull(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    sectionFanficCreatedAtIndex: uniqueIndex(
      "koreader_highlights_section_fanfic_created_idx"
    ).on(table.sectionFanficId, table.highlightCreatedAt),
  })
);

export const settings = schema.table("settings", {
  id: serial().primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  activeIntegrationId: integer("active_integration_id").references(
    () => integrations.id
  ),
  defaultSectionId: integer("default_section_id").references(
    () => sections.id
  ),
  languageCode: varchar("language_code").notNull().default("en"),
  enableTranslation: boolean("enable_translation").notNull().default(false),
  creationTime: timestamp("creation_time").notNull().defaultNow(),
  updateTime: timestamp("update_time").$onUpdate(() => new Date()),
});
