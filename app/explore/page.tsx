import { ExploreClientWrapper } from "@/explore/(components)/ExploreClientWrapper";
import { getSavedSearchesCached } from "@/db/savedSearches";
import { listUserSectionsCached } from "@/db/sections";
import { getSettings } from "@/db/settings";
import { getUserFanficExternalIds } from "@/db/fanfics";
import { auth } from "@/auth";
import { Metadata } from "next";
import { StreamingWrapper, TableSkeleton } from "@/components/base/StreamingWrapper";

export const metadata: Metadata = {
  title: "Penio Fanfic - Explore",
};

// Separate component for heavy data loading
async function ExploreData({ userId }: { userId: string }) {
  const [savedSearches, sections, settings, userFanficIds] = await Promise.all([
    getSavedSearchesCached(userId),
    listUserSectionsCached(userId),
    getSettings(userId),
    getUserFanficExternalIds(userId),
  ]);

  return (
    <ExploreClientWrapper 
      savedSearches={savedSearches} 
      userId={userId}
      sections={sections}
      userSettings={settings}
      userFanficIds={userFanficIds}
    />
  );
}

export default async function Page() {
  const session = await auth();
  
  if (!session?.user) {
    return null; // Let middleware handle redirect
  }
  
  const { user } = session;

  return (
    <StreamingWrapper 
      fallback={<TableSkeleton />}
      className="min-h-screen"
    >
      <ExploreData userId={user.id} />
    </StreamingWrapper>
  );
}
