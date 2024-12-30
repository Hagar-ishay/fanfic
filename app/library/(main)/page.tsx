import { Section } from "@/library/(components)/Section";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Metadata } from "next";
import { FC } from "react";
import { selectOrCreateSections } from "@/db/sections";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

const Page: FC = async () => {
  await connection();

  const user = await currentUser();
  if (!user) {
    return null;
  }
  const sections = await selectOrCreateSections(user.id);
  const topLevelSections = sections.filter((sec) => sec.parentId === null);

  return (
    <div className="flex flex-col space-y-4">
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
};

export default Page;
