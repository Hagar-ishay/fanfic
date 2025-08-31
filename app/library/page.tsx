import { selectOrCreateSections } from "@/db/sections";
import { Section } from "@/library/(components)/Section";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { SetTopbar } from "@/components/base/SetTopbar";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { LibraryTopbarSearch } from "@/library/(components)/LibraryTopbarSearch";
import { listUserFanfics } from "@/db/fanfics";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const { user } = (await auth())!;

  const sections = await selectOrCreateSections(user.id);
  const topLevelSections = sections.filter((sec) => sec.parentId === null);
  const userFanfics = await listUserFanfics(user.id);

  return (
    <>
      <SetTopbar segments={[{ label: "Library", href: "/library" }]}>
        <LibraryTopbarSearch userFanfics={userFanfics} />
        <AddNewSectionButton />
      </SetTopbar>
      <div className="bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="grid gap-4">
            {topLevelSections.map((section) => (
              <Link key={section.id} href={`/library/sections/${section.id}`}>
                <div className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <Section
                    section={section}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
