import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteSavedSearch, getSavedSearches } from "@/db/savedSearches";
import { SearchBuilder } from "@/explore/(components)/SearchBuilder";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/base/ConfirmationModal";
import { TrashIcon } from "lucide-react";
import { SavedSearches } from "@/explore/(components)/SavedSearches";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const savedSearches = await getSavedSearches(user.id);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-end">
        {process.env.NODE_ENV === "development" && <SearchBuilder />}
      </div>
      <div className="flex justify-end gap-2">
        <Card className="p-6 w-2/3">
          <h2 className="text-xl font-bold mb-4">
            You might like these Fanfics:
          </h2>
          <div className="text-muted-foreground text-center py-8">
            This feature is still a work in progress. Stay tuned!
          </div>
        </Card>
        {savedSearches.length > 0 ? (
          <SavedSearches savedSearches={savedSearches} />
        ) : (
          <Card className="p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Saved Searches</h2>
            <div className="text-muted-foreground text-center py-8">
              This feature is still a work in progress. Stay tuned!
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
