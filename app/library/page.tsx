import { selectOrCreateSections } from "@/db/sections";
import { Section } from "@/library/(components)/Section";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { SetTopbar } from "@/components/base/SetTopbar";
import { listUserFanfics } from "@/db/fanfics";
import dynamic from "next/dynamic";

const AddNewSectionButton = dynamic(() =>
  import("@/library/(components)/AddNewSectionButton").then((mod) => ({
    default: mod.AddNewSectionButton,
  }))
);

const LibraryTopbarSearch = dynamic(() =>
  import("@/library/(components)/LibraryTopbarSearch").then((mod) => ({
    default: mod.LibraryTopbarSearch,
  }))
);

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const { user } = (await auth())!;

  // Database functions already have caching built-in with "use cache"
  const [allSections, userFanfics] = await Promise.all([
    selectOrCreateSections(user.id),
    listUserFanfics(user.id),
  ]);

  const topLevelSections = allSections.filter((sec) => sec.parentId === null);

  return (
    <>
      <SetTopbar segments={[{ label: "Library", href: "/library" }]}>
        <LibraryTopbarSearch userFanfics={userFanfics} />
        <AddNewSectionButton />
      </SetTopbar>
      <div className="bg-gradient-to-br from-background via-muted/20 to-background w-full min-h-full overflow-x-hidden">
        <div className="w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 max-w-full sm:max-w-7xl sm:mx-auto">
          <div className="grid gap-4 w-full max-w-full">
            {topLevelSections.map((section) => (
              <Link key={section.id} href={`/library/sections/${section.id}`}>
                <div className="transform transition-all duration-200  hover:shadow-lg">
                  <Section section={section} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
