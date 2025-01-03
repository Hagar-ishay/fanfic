import {
  integer,
  jsonb,
  pgSchema,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const schema = pgSchema("fanfiction");

export const credentialsType = schema.enum("credentials_type", ["AO3"]);

export const sections = schema.table(
  "sections",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    parentId: integer("parent_id").references((): any => sections.id),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
    userId: varchar("user_id").notNull(),
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
    fanficId: integer().notNull(),
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
    fanficsfanficIdUnique: uniqueIndex("fanfics_fanfic_id_unique").on(
      table.fanficId
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
    userId: varchar("user_id").notNull(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
    lastSent: timestamp("last_sent"),
    latestStartingChapter: integer("latest_starting_chapter"),
    editableLabels: jsonb("edditable_labels")
      .$type<string[]>()
      .default([])
      .notNull(),
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
