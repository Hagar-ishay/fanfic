import { selectSectionFanfic } from "@/db/fanfics";
import { getSection, listUserSections } from "@/db/sections";
import { Section } from "@/library/(components)/Section";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

type Props = {
  params: Promise<{ sectionId: string }>;
};

export async function generateMetadata({ params }: Props) {
  await connection();
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const currentSection = await getSection(sectionId);

  if (!currentSection) {
    return notFound();
  }

  return {
    title: `Penio Fanfic - ${currentSection.name}`,
  };
}

export default async function Page({ params }: Props) {
  await connection();
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  const [userSections, fanfics] = await Promise.all([
    listUserSections(user.id),
    selectSectionFanfic([sectionId]),
  ]);

  const childSections = userSections.filter(
    (section) => section.parentId === sectionId
  );

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  return (
    <div className="flex flex-col">
      {childSections.map((child) => (
        <Link key={child.id} href={`/library/sections/${child.id}`}>
          <Section
            section={child}
            transferableSections={transferableSections}
          />
        </Link>
      ))}
      <FanficList fanfics={fanfics} sectionId={sectionId} />
    </div>
  );
}
