import { Card } from "@/components/ui/card";
import { SearchBuilder } from "@/explore/(components)/SearchBuilder";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-end">
        <SearchBuilder />
      </div>
      <div className="flex justify-end gap-2">
        <Card className="p-6 w-2/3">
          <h2 className="text-xl font-bold mb-4">
            You might like these Fanfics:
          </h2>
        </Card>
        <Card className="p-6 w-1/3">
          <h2 className="text-md font-bold mb-4">Saved Searches</h2>
        </Card>
      </div>
    </div>
  );
}
