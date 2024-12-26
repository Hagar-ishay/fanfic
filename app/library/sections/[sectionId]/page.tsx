import Link from "next/link";
import { db } from "@/db/db";
import { sections } from "@/db/schema";
import * as drizz from "drizzle-orm";
import { selectSectionFanfic } from "@/db/db";

export default async function Page({ params }: { params: { sectionId: string } }) {
  const sectionId = parseInt(params.sectionId);
  const currentSection = await db
    .select()
    .from(sections)
    .where(drizz.eq(sections.id, sectionId))
    .limit(1);

  const parentLink = currentSection[0]?.parentId
    ? `/library/sections/${currentSection[0].parentId}`
    : "/library";

  const childSections = await db
    .select()
    .from(sections)
    .where(drizz.eq(sections.parentId, sectionId));

  const fanfics = await selectSectionFanfic([sectionId]);

  return (
    <div>
      <Link href={parentLink}>Back</Link>
      <h2>Child Sections:</h2>
      {childSections.map((child) => (
        <div key={child.id}>
          <Link href={`/library/sections/${child.id}`}>{child.displayName}</Link>
        </div>
      ))}
      <h2>Fanfics:</h2>
      {fanfics.map((f) => (
        <div key={f.fanfics.id}>
          <Link href="#">{f.fanfics.title}</Link>
        </div>
      ))}
    </div>
  );
}
