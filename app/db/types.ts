import type { fanfics, sections } from "@/db/schema";
import type { SerializeFrom } from "@remix-run/node";

export type NewFanfic = typeof fanfics.$inferInsert;
export type Fanfic = SerializeFrom<typeof fanfics.$inferSelect>;
export type Section = SerializeFrom<typeof sections.$inferSelect>;
