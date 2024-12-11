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

export const ratingEnum = schema.enum("rating", [
  "MASTERPIECE",
  "AMAZING",
  "GOOD",
  "OK",
  "MEH",
]);

export const credentialsType = schema.enum("credentials_type", ["AO3"]);

export const sections = schema.table(
  "sections",
  {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    displayName: varchar("display_name").notNull(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    sectionsNameUnique: uniqueIndex("sections_name_unique").on(table.name),
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
    sectionId: integer("section_id")
      .references(() => sections.id)
      .notNull()
      .default(1),
    authorUrl: varchar("author_url"),
    sourceUrl: varchar("source_url").notNull(),
    downloadLink: varchar("download_link").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    completedAt: timestamp("completed_at"),
    lastSent: timestamp("last_sent"),
    latestStartingChapter: integer("latest_starting_chapter"),
    tags: jsonb()
      .$type<{ [category: string]: string[] }>()
      .notNull()
      .default({}),
    wordCount: integer("word_count"),
    chapterCount: varchar("chapter_count"),
    language: varchar(),
    rating: ratingEnum(),
    creationTime: timestamp("creation_time").notNull().defaultNow(),
    updateTime: timestamp("update_time").$onUpdate(() => new Date()),
  },
  (table) => ({
    fanficsfanficIdUnique: uniqueIndex("fanfics_fanfic_id_unique").on(
      table.fanficId
    ),
  })
);

export const credentials = schema.table(
  "credentials",
  {
    id: serial().primaryKey(),
    type: credentialsType().notNull(),
    username: varchar().notNull(),
    password: varchar().notNull(),
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
