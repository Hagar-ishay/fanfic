import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getBreadcrumbs, getSection, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { auth } from "@/auth";
import { Header } from "@/components/base/Header";
import { AddFanfic } from "@/library/sections/[sectionId]/(components)/AddFanfic";
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
  const { user } = (await auth())!;

  if (!user) {
    return notFound();
  }

  const [userSections, fanfics, currentSection] = await Promise.all([
    listUserSections(user.id),
    selectSectionFanfic([sectionId]),
    getSection(sectionId),
  ]);

  if (!currentSection) {
    return notFound();
  }

  const childSections = userSections.filter((section) => section.parentId === sectionId);

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  const segments = await getBreadcrumbs(sectionId, currentSection.name, currentSection.parentId);

  return (
    <>
      <Header segments={segments}>
        <AddFanfic sectionId={sectionId} userId={user.id} />
      </Header>
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
