import { Card } from "@/components/ui/card";
import { getSavedSearches } from "@/db/savedSearches";
import { auth } from "@/auth";
import { Metadata } from "next";
import { SavedSearches } from "@/explore/(components)/SavedSearches";

export const metadata: Metadata = {
  title: "Penio Fanfic - Explore",
};

export default async function Page() {
  const { user } = (await auth())!;

  const savedSearches = await getSavedSearches(user.id);

  return (
    <div className="flex flex-col gap-6 p-4">
      {savedSearches.length > 0 ? (
        <SavedSearches savedSearches={savedSearches} />
      ) : (
        <Card className="p-6 ">
          <div className="text-muted-foreground text-center py-8">
            This feature is still a work in progress. Stay tuned!
          </div>
        </Card>
      )}
    </div>
  );
}
