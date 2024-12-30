import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getSection, listChildSections, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficCard from "@/library/sections/[sectionId]/(components)/FanficCard";
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

  const displayName = currentSection.displayName;

  return {
    title: `Penio Fanfic - ${displayName}`,
  };
}

export default async function Page({ params }: Props) {
  await connection();
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);

  const [childSections, fanfics] = await Promise.all([
    listChildSections(sectionId),
    selectSectionFanfic([sectionId]),
  ]);

  return (
    <div className="flex flex-col">
      {childSections.map((child) => (
        <Link key={child.id} href={`/library/sections/${child.id}`}>
          <Section section={child} transferableSections={[]} />
        </Link>
      ))}
      {fanfics.map((fanfic) => (
        <Link
          key={fanfic.section_fanfics.id}
          href={`/library/sections/${sectionId}/fanfics/${fanfic.section_fanfics.id}`}
        >
          <FanficCard
            fanfic={{
              ...fanfic.fanfics,
              ...fanfic.section_fanfics,
              id: fanfic.section_fanfics.id,
            }}
            isDragging={false}
            isPending={false}
          />
        </Link>
      ))}
    </div>
  );
}
