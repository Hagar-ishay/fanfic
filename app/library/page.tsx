import { selectOrCreateSections } from "@/db/db";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const sections = await selectOrCreateSections(user.id);
  const topLevelSections = sections.filter((sec) => sec.parentId === null);

  return (
    <div className="flex flex-col space-y-4">
      {topLevelSections.map((sec) => (
        <Link key={sec.id} href={`/library/sections/${sec.id}`}>
          {sec.displayName}
        </Link>
      ))}
    </div>
  );
}
