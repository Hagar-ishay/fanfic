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
	}),
);

export const fanfics = schema.table(
	"fanfics",
	{
		id: serial().primaryKey(),
		fanficId: integer(),
		title: varchar().notNull(),
		summary: varchar(),
		author: varchar(),
		sectionId: integer("section_id").references(() => sections.id),
		authorUrl: varchar("author_url"),
		sourceUrl: varchar("source_url").notNull(),
		downloadLink: varchar("download_link").notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
		completedAt: timestamp("completed_at"),
		lastSent: timestamp("last_sent"),
		tags: jsonb()
			.$type<{ [category: string]: string[] }>()
			.notNull()
			.default({}),
		wordCount: integer("word_count"),
		chapterCount: integer("chapter_count"),
		language: varchar(),
		rating: ratingEnum(),
		creationTime: timestamp("creation_time").notNull().defaultNow(),
		updateTime: timestamp("update_time").$onUpdate(() => new Date()),
	},
	(table) => ({
		fanficsfanficIdUnique: uniqueIndex("fanfics_fanfic_id_unique").on(
			table.fanficId,
		),
	}),
);
