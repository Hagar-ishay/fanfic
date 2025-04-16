import { selectOrCreateSections } from "@/db/sections";
import { Section } from "@/library/(components)/Section";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/base/Header";
import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Suspense } from "react";
import { listUserFanfics } from "@/db/fanfics";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const session = await auth();

  const { user } = (await auth())!;

  const sections = await selectOrCreateSections(user.id);
  const topLevelSections = sections.filter((sec) => sec.parentId === null);

  return (
    <>
      <Header segments={[{ label: "Library", href: "/library" }]}>
        <AddNewSectionButton />
      </Header>
      <div className="flex flex-col">
        {topLevelSections.map((section) => (
          <Link key={section.id} href={`/library/sections/${section.id}`}>
            <Section
              section={section}
              transferableSections={sections.filter((tranfser) => tranfser.id !== section.id)}
            />
          </Link>
        ))}
      </div>
    </>
  );
}
