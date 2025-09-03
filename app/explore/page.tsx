import { ExploreClientWrapper } from "@/explore/(components)/ExploreClientWrapper";
import { getSavedSearches } from "@/db/savedSearches";
import { listUserSections } from "@/db/sections";
import { getSettings } from "@/db/settings";
import { getUserFanficExternalIds } from "@/db/fanfics";
import { auth } from "@/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penio Fanfic - Explore",
};

export default async function Page() {
  const session = await auth();
  
  if (!session?.user) {
    return null; // Let middleware handle redirect
  }
  
  const { user } = session;
  
  const [savedSearches, sections, settings, userFanficIds] = await Promise.all([
    getSavedSearches(user.id),
    listUserSections(user.id),
    getSettings(user.id),
    getUserFanficExternalIds(user.id),
  ]);

  return (
    <ExploreClientWrapper 
      savedSearches={savedSearches} 
      userId={user.id}
      sections={sections}
      userSettings={settings}
      userFanficIds={userFanficIds}
    />
  );
}
