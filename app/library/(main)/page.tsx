import { selectOrCreateSections } from "@/db/sections";
import { Section } from "@/library/(components)/Section";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const sections = await selectOrCreateSections(user.id);
  const topLevelSections = sections.filter((sec) => sec.parentId === null);

  return (
    <div className="flex flex-col">
      {topLevelSections.map((section) => (
        <Link key={section.id} href={`/library/sections/${section.id}`}>
          <Section
            section={section}
            transferableSections={sections.filter(
              (tranfser) => tranfser.id !== section.id
            )}
          />
        </Link>
      ))}
    </div>
  );
}
