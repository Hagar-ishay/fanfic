import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getSection, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import { currentUser } from "@clerk/nextjs/server";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import LibraryBreadcrumbs from "@/library/(components)/LibraryBreadcrumbs";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";

export const maxDuration = 59;

type Props = {
  params: Promise<{ sectionId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const currentSection = await getSection(sectionId);

  if (!currentSection) {
    return notFound();
  }

  const displayName = currentSection.name;

  return {
    title: `Penio Fanfic - ${displayName}`,
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  const [userSections, fanfics] = await Promise.all([listUserSections(user.id), selectSectionFanfic([sectionId])]);

  const childSections = userSections.filter((section) => section.parentId === sectionId);

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  return (
    <>
      <LibraryBreadcrumbs userId={user.id} sectionId={sectionId} />
      <div className="flex flex-col">
        {childSections.map((child) => (
          <Link key={child.id} href={`/library/sections/${child.id}`}>
            <Section section={child} transferableSections={transferableSections} />
          </Link>
        ))}
        {fanfics.length == 0 ? (
          <LibraryHelp showAsPage />
        ) : (
          <FanficList fanfics={fanfics} sectionId={sectionId} transferableSections={transferableSections} />
        )}
      </div>
    </>
  );
}
