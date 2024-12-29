import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getSection, listChildSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficCard from "@/library/sections/[sectionId]/(components)/FanficCard";

type Props = {
  params: Promise<{ sectionId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const requestParams = await params;
  const sectionId = parseInt(requestParams.sectionId);
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
  const requestParams = await params;

  const sectionId = parseInt(requestParams.sectionId);

  const [childSections, fanfics] = await Promise.all([
    listChildSections(sectionId),
    selectSectionFanfic([sectionId]),
  ]);

  return (
    <div className="flex flex-col space-y-4">
      {childSections.map((child) => (
        <Link key={child.id} href={`/library/sections/${child.id}`}>
          <Section displayName={child.displayName} />
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
